import { Types } from 'mongoose';
import { Complaint, IComplaint } from '../models/complaint.model';
import { ComplaintUpdate } from '../models/complaintUpdate.model';
import { WorkerTask, TaskStatus } from '../models/workerTask.model';
import { SlaRule } from '../models/slaRule.model';
import { User } from '../models/user.model';
import {
  ComplaintStatus,
  PriorityLevel,
  EscalationLevel,
  DEFAULT_SLA_HOURS,
  CATEGORY_DEPARTMENT_MAP
} from '../config/constants';
import { getAiProvider } from '../providers/ai';
import { NotificationService } from '../providers/notifications/notification.service';
import { AuditService } from './audit.service';

export interface CreateComplaintDTO {
  citizenId: Types.ObjectId | string;
  title: string;
  description: string;
  source?: 'TEXT' | 'VOICE';
  audioUrl?: string;
  transcript?: string;
  category?: string;
  villageId?: string;
  villageName?: string;
  panchayatId?: string;
  panchayatName?: string;
  blockId?: string;
  districtId?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  landmark?: string;
  images?: string[];
  videos?: string[];
  documents?: string[];
  affectedPeopleEstimate?: number;
  publicSafetyRisk?: boolean;
}

export class ComplaintService {
  // Haversine formula to calculate distance in meters between two lat/lng points
  private static calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Token similarity between two strings
  private static calculateTextSimilarity(str1: string, str2: string): number {
    const tokens1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
    const tokens2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));
    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    let intersection = 0;
    tokens1.forEach((t) => {
      if (tokens2.has(t)) intersection++;
    });

    const union = new Set([...tokens1, ...tokens2]).size;
    return intersection / union;
  }

  // Detect duplicates within same village or nearby radius
  static async detectDuplicates(
    category: string,
    description: string,
    lat?: number,
    lng?: number,
    villageId?: string
  ): Promise<Array<{ complaintId: string; score: number; title: string }>> {
    const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const query: any = {
      category,
      status: { $nin: [ComplaintStatus.CLOSED, ComplaintStatus.REJECTED] },
      createdAt: { $gte: recentCutoff }
    };

    if (villageId) {
      query.villageId = villageId;
    }

    const potentialMatches = await Complaint.find(query).limit(20);
    const duplicates: Array<{ complaintId: string; score: number; title: string }> = [];

    for (const item of potentialMatches) {
      const textScore = this.calculateTextSimilarity(description, item.description);
      let geoScore = 0;

      if (lat && lng && item.latitude && item.longitude) {
        const distance = this.calculateDistanceMeters(lat, lng, item.latitude, item.longitude);
        if (distance < 200) {
          geoScore = 1.0;
        } else if (distance < 600) {
          geoScore = 0.6;
        } else if (distance < 1200) {
          geoScore = 0.3;
        }
      }

      const combinedScore = geoScore > 0 ? textScore * 0.5 + geoScore * 0.5 : textScore;

      if (combinedScore >= 0.45) {
        duplicates.push({
          complaintId: item.complaintId,
          score: Math.round(combinedScore * 100) / 100,
          title: item.title
        });
      }
    }

    return duplicates.sort((a, b) => b.score - a.score);
  }

  // Generate unique complaint ID
  static async generateComplaintId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await Complaint.countDocuments();
    const serial = String(count + 1).padStart(4, '0');
    return `GRV-${year}-${serial}`;
  }

  static async createComplaint(data: CreateComplaintDTO, citizenUser: any, ipAddress?: string): Promise<IComplaint> {
    // 1. Run AI analysis
    const aiProvider = getAiProvider();
    const textToAnalyze = `${data.title} ${data.description}`;
    const aiAnalysis = await aiProvider.analyzeComplaint(textToAnalyze, {
      villageContext: data.villageName,
      hasImage: (data.images && data.images.length > 0)
    });

    const category = data.category || aiAnalysis.category;
    const department = CATEGORY_DEPARTMENT_MAP[category] || aiAnalysis.department;

    // 2. Deterministic priority computation
    let priority = aiAnalysis.priority;
    let priorityScore = aiAnalysis.priorityScore;

    if (data.publicSafetyRisk) {
      priority = PriorityLevel.CRITICAL;
      priorityScore = Math.max(priorityScore, 90);
    } else if ((data.affectedPeopleEstimate || 0) > 100) {
      if (priority !== PriorityLevel.CRITICAL) priority = PriorityLevel.HIGH;
      priorityScore = Math.max(priorityScore, 75);
    }

    // 3. Duplicate detection
    const possibleDuplicates = await this.detectDuplicates(
      category,
      data.description,
      data.latitude,
      data.longitude,
      data.villageId
    );

    // 4. Calculate deadline based on SLA rules or defaults
    const slaHours = DEFAULT_SLA_HOURS[priority] || 72;
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const complaintId = await this.generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      citizenId: citizenUser._id,
      title: data.title,
      description: data.description,
      source: data.source || 'TEXT',
      audioUrl: data.audioUrl,
      transcript: data.transcript,
      category,
      department,
      priority,
      priorityScore,
      aiConfidence: aiAnalysis.confidence,
      aiReasoning: aiAnalysis.reason,
      status: ComplaintStatus.SUBMITTED,
      villageId: data.villageId || citizenUser.villageId,
      villageName: data.villageName,
      panchayatId: data.panchayatId || citizenUser.panchayatId,
      panchayatName: data.panchayatName,
      blockId: data.blockId || citizenUser.blockId,
      districtId: data.districtId || citizenUser.districtId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      landmark: data.landmark,
      location: {
        type: 'Point',
        coordinates: [data.longitude || 0, data.latitude || 0]
      },
      images: data.images || [],
      videos: data.videos || [],
      documents: data.documents || [],
      affectedPeopleEstimate: data.affectedPeopleEstimate || 10,
      publicSafetyRisk: !!data.publicSafetyRisk,
      deadline,
      escalationLevel: EscalationLevel.NONE,
      possibleDuplicates
    });

    // Create initial timeline update
    await ComplaintUpdate.create({
      complaintId: complaint._id,
      previousStatus: ComplaintStatus.SUBMITTED,
      newStatus: ComplaintStatus.SUBMITTED,
      changedById: citizenUser._id,
      changedByName: citizenUser.name,
      changedByRole: citizenUser.role,
      message: 'Complaint submitted by citizen.',
      notes: `AI suggested category: ${category} | Priority: ${priority}`
    });

    // Notify Citizen
    await NotificationService.send({
      recipientId: citizenUser._id,
      title: 'Complaint Registered',
      message: `Your grievance ${complaint.complaintId} has been lodged under ${category}. We will keep you updated.`,
      type: 'COMPLAINT_UPDATE',
      relatedComplaintId: complaint._id,
      relatedComplaintCode: complaint.complaintId
    });

    // Log Audit
    await AuditService.log({
      actorId: citizenUser._id,
      actorName: citizenUser.name,
      actorRole: citizenUser.role,
      action: 'COMPLAINT_CREATED',
      resource: 'Complaint',
      resourceId: complaint.complaintId,
      details: { category, priority, villageName: data.villageName },
      ipAddress
    });

    return complaint;
  }

  // Officer verifies or updates complaint
  static async verifyComplaint(
    complaintId: string,
    officerUser: any,
    decision: 'VERIFIED' | 'REJECTED' | 'REQUESTED_INFORMATION',
    notes: string,
    overridePriority?: PriorityLevel
  ) {
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId },
        ...(Types.ObjectId.isValid(complaintId) ? [{ _id: complaintId }] : [])
      ]
    });
    if (!complaint) throw new Error('Complaint not found.');

    const oldStatus = complaint.status;
    complaint.status = decision as ComplaintStatus;
    complaint.assignedOfficerId = officerUser._id;

    if (overridePriority) {
      complaint.priority = overridePriority;
      const slaHours = DEFAULT_SLA_HOURS[overridePriority];
      complaint.deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    }

    await complaint.save();

    await ComplaintUpdate.create({
      complaintId: complaint._id,
      previousStatus: oldStatus,
      newStatus: complaint.status,
      changedById: officerUser._id,
      changedByName: officerUser.name,
      changedByRole: officerUser.role,
      message: `Panchayat Officer marked complaint as ${decision}.`,
      notes
    });

    await NotificationService.send({
      recipientId: complaint.citizenId,
      title: `Grievance Status: ${decision}`,
      message: `Your grievance ${complaint.complaintId} was reviewed by officer ${officerUser.name}: ${notes}`,
      type: 'COMPLAINT_UPDATE',
      relatedComplaintId: complaint._id,
      relatedComplaintCode: complaint.complaintId
    });

    return complaint;
  }

  // Officer assigns a field worker
  static async assignWorker(
    complaintId: string,
    workerId: string,
    officerUser: any,
    instructions?: string,
    deadlineDate?: Date
  ) {
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId },
        ...(Types.ObjectId.isValid(complaintId) ? [{ _id: complaintId }] : [])
      ]
    });
    if (!complaint) throw new Error('Complaint not found.');

    const worker = await User.findById(workerId);
    if (!worker) throw new Error('Worker not found.');

    const oldStatus = complaint.status;
    complaint.status = ComplaintStatus.ASSIGNED;
    complaint.assignedWorkerId = worker._id;
    if (deadlineDate && !isNaN(deadlineDate.getTime())) {
      complaint.deadline = deadlineDate;
    }
    await complaint.save();

    // Create or update WorkerTask
    const taskCount = await WorkerTask.countDocuments();
    const taskId = `TSK-${new Date().getFullYear()}-${String(taskCount + 1).padStart(4, '0')}`;

    const task = await WorkerTask.create({
      taskId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      workerId: worker._id,
      assignedById: officerUser._id,
      title: complaint.title,
      instructions: instructions || 'Please visit location and verify/resolve the issue.',
      category: complaint.category,
      priority: complaint.priority,
      villageName: complaint.villageName,
      landmark: complaint.landmark,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      deadline: complaint.deadline,
      status: TaskStatus.ASSIGNED
    });

    // Increment worker task count
    await User.findByIdAndUpdate(worker._id, { $inc: { assignedTasksCount: 1 } });

    await ComplaintUpdate.create({
      complaintId: complaint._id,
      previousStatus: oldStatus,
      newStatus: ComplaintStatus.ASSIGNED,
      changedById: officerUser._id,
      changedByName: officerUser.name,
      changedByRole: officerUser.role,
      message: `Worker ${worker.name} assigned to the task.`,
      notes: instructions
    });

    // Notify Worker
    await NotificationService.send({
      recipientId: worker._id,
      title: 'New Task Assigned',
      message: `You have been assigned task for complaint ${complaint.complaintId} in ${complaint.villageName}.`,
      type: 'TASK_ASSIGNED',
      relatedComplaintId: complaint._id,
      relatedComplaintCode: complaint.complaintId
    });

    // Notify Citizen
    await NotificationService.send({
      recipientId: complaint.citizenId,
      title: 'Worker Assigned',
      message: `Field worker ${worker.name} has been assigned to address your grievance.`,
      type: 'COMPLAINT_UPDATE',
      relatedComplaintId: complaint._id,
      relatedComplaintCode: complaint.complaintId
    });

    return { complaint, task };
  }

  // Citizen verifies resolution: Yes -> CLOSED, No -> REOPENED
  static async verifyResolution(
    complaintId: string,
    citizenUser: any,
    isResolved: boolean,
    feedback?: string,
    rating?: number,
    reopenReason?: string
  ) {
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) throw new Error('Complaint not found.');

    if (complaint.citizenId.toString() !== citizenUser._id.toString()) {
      throw new Error('Unauthorized: Only the citizen who reported this grievance can verify resolution.');
    }

    const oldStatus = complaint.status;

    if (isResolved) {
      complaint.status = ComplaintStatus.CLOSED;
      complaint.isCitizenVerified = true;
      complaint.citizenVerifiedAt = new Date();
      complaint.closedAt = new Date();
      complaint.citizenFeedback = feedback;
      complaint.citizenRating = rating || 5;
      await complaint.save();

      await ComplaintUpdate.create({
        complaintId: complaint._id,
        previousStatus: oldStatus,
        newStatus: ComplaintStatus.CLOSED,
        changedById: citizenUser._id,
        changedByName: citizenUser.name,
        changedByRole: citizenUser.role,
        message: 'Citizen verified resolution and closed complaint.',
        notes: feedback ? `Rating: ${rating}/5 - ${feedback}` : `Rating: ${rating}/5`
      });

      if (complaint.assignedOfficerId) {
        await NotificationService.send({
          recipientId: complaint.assignedOfficerId,
          title: 'Complaint Closed by Citizen',
          message: `Citizen satisfied with resolution for ${complaint.complaintId}. Rating: ${rating}/5.`,
          type: 'COMPLAINT_UPDATE',
          relatedComplaintId: complaint._id,
          relatedComplaintCode: complaint.complaintId
        });
      }
    } else {
      complaint.status = ComplaintStatus.REOPENED;
      complaint.isReopened = true;
      complaint.reopenReason = reopenReason || 'Issue still exists after field worker marked resolved.';
      complaint.reopenedAt = new Date();
      await complaint.save();

      await ComplaintUpdate.create({
        complaintId: complaint._id,
        previousStatus: oldStatus,
        newStatus: ComplaintStatus.REOPENED,
        changedById: citizenUser._id,
        changedByName: citizenUser.name,
        changedByRole: citizenUser.role,
        message: 'Citizen rejected resolution: Issue still persists. Complaint reopened.',
        notes: reopenReason
      });

      // Alert Officer and Admin
      if (complaint.assignedOfficerId) {
        await NotificationService.send({
          recipientId: complaint.assignedOfficerId,
          title: 'URGENT: Complaint Reopened by Citizen',
          message: `Citizen reported issue still persists for ${complaint.complaintId}: ${reopenReason}`,
          type: 'COMPLAINT_UPDATE',
          relatedComplaintId: complaint._id,
          relatedComplaintCode: complaint.complaintId
        });
      }
    }

    return complaint;
  }

  // Get details with updates timeline
  static async getComplaintTimeline(complaintId: string) {
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId },
        ...(Types.ObjectId.isValid(complaintId) ? [{ _id: complaintId }] : [])
      ]
    })
      .populate('citizenId', 'name phone languagePreference')
      .populate('assignedOfficerId', 'name phone email')
      .populate('assignedWorkerId', 'name phone');

    if (!complaint) throw new Error('Complaint not found.');

    const updates = await ComplaintUpdate.find({ complaintId: complaint._id }).sort({ createdAt: 1 });
    const tasks = await WorkerTask.find({ complaintId: complaint._id }).sort({ createdAt: -1 });

    return { complaint, updates, tasks };
  }
}
