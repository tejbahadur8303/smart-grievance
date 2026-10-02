import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ComplaintService } from '../services/complaint.service';
import { Complaint } from '../models/complaint.model';
import { UserRole, ComplaintStatus } from '../config/constants';
import { getStorageProvider } from '../providers/storage';

export class ComplaintController {
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const storage = getStorageProvider();

      const images: string[] = [];
      let audioUrl: string | undefined = undefined;

      if (files?.images) {
        for (const file of files.images) {
          const uploaded = await storage.uploadFile(file);
          images.push(uploaded.url);
        }
      }

      if (files?.audio && files.audio.length > 0) {
        const uploaded = await storage.uploadFile(files.audio[0]);
        audioUrl = uploaded.url;
      }

      // If passed as body URLs
      if (req.body.images && Array.isArray(req.body.images)) {
        images.push(...req.body.images);
      }
      if (req.body.audioUrl) {
        audioUrl = req.body.audioUrl;
      }

      const complaintData = {
        citizenId: req.user!._id,
        title: req.body.title,
        description: req.body.description,
        source: req.body.source || (audioUrl ? 'VOICE' : 'TEXT'),
        audioUrl,
        transcript: req.body.transcript,
        category: req.body.category,
        villageId: req.body.villageId || req.user?.villageId,
        villageName: req.body.villageName,
        panchayatId: req.body.panchayatId || req.user?.panchayatId,
        panchayatName: req.body.panchayatName,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
        address: req.body.address,
        landmark: req.body.landmark,
        images,
        affectedPeopleEstimate: req.body.affectedPeopleEstimate ? parseInt(req.body.affectedPeopleEstimate, 10) : 10,
        publicSafetyRisk: req.body.publicSafetyRisk === 'true' || req.body.publicSafetyRisk === true
      };

      const complaint = await ComplaintService.createComplaint(complaintData, req.user!, req.ip);

      res.status(201).json({
        success: true,
        message: 'Complaint created successfully',
        data: complaint
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create complaint',
        code: 'COMPLAINT_CREATION_FAILED'
      });
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const skip = (page - 1) * limit;

      const filter: any = {};

      // Role-based scoping
      if (user.role === UserRole.CITIZEN) {
        filter.citizenId = user._id;
      } else if (user.role === UserRole.PANCHAYAT_OFFICER) {
        if (user.panchayatId) filter.panchayatId = user.panchayatId;
      } else if (user.role === UserRole.FIELD_WORKER) {
        filter.assignedWorkerId = user._id;
      }

      // Query filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.category) filter.category = req.query.category;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.villageId) filter.villageId = req.query.villageId;

      if (req.query.overdue === 'true') {
        filter.deadline = { $lt: new Date() };
        filter.status = { $nin: [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED] };
      }

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search as string, 'i');
        filter.$or = [
          { complaintId: searchRegex },
          { title: searchRegex },
          { description: searchRegex },
          { villageName: searchRegex }
        ];
      }

      const [items, total] = await Promise.all([
        Complaint.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('citizenId', 'name phone')
          .populate('assignedWorkerId', 'name phone'),
        Complaint.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const complaint = await Complaint.findOne({ complaintId: req.params.id })
        .populate('citizenId', 'name phone languagePreference')
        .populate('assignedOfficerId', 'name phone email')
        .populate('assignedWorkerId', 'name phone');

      if (!complaint) {
        res.status(404).json({ success: false, message: 'Complaint not found' });
        return;
      }

      // Role check: Citizens can only see their own complaint
      if (req.user!.role === UserRole.CITIZEN && complaint.citizenId._id.toString() !== req.user!._id.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized to view this complaint' });
        return;
      }

      res.status(200).json({ success: true, data: complaint });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTimeline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const timelineData = await ComplaintService.getComplaintTimeline(req.params.id as string);
      res.status(200).json({ success: true, data: timelineData });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async verify(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { decision, notes, overridePriority } = req.body;
      const complaint = await ComplaintService.verifyComplaint(
        req.params.id as string,
        req.user!,
        decision,
        notes || `Officer decision: ${decision}`,
        overridePriority
      );
      res.status(200).json({ success: true, message: 'Complaint status updated', data: complaint });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async assignWorker(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { workerId, instructions, deadline } = req.body;
      let deadlineDate: Date | undefined;
      if (deadline) {
        const d = new Date(deadline);
        if (!isNaN(d.getTime())) {
          deadlineDate = d;
        }
      }
      const result = await ComplaintService.assignWorker(
        req.params.id as string,
        workerId,
        req.user!,
        instructions,
        deadlineDate
      );
      res.status(200).json({ success: true, message: 'Worker assigned successfully', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async verifyResolution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { isResolved, feedback, rating, reopenReason } = req.body;
      const complaint = await ComplaintService.verifyResolution(
        req.params.id as string,
        req.user!,
        isResolved === true || isResolved === 'true',
        feedback,
        rating ? parseInt(rating, 10) : undefined,
        reopenReason
      );

      res.status(200).json({
        success: true,
        message: isResolved ? 'Complaint closed with citizen satisfaction.' : 'Complaint reopened for rework.',
        data: complaint
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async submitFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { rating, feedback } = req.body;
      const complaint = await Complaint.findOneAndUpdate(
        { complaintId: req.params.id as string, citizenId: req.user!._id },
        { citizenRating: rating, citizenFeedback: feedback },
        { new: true }
      );
      if (!complaint) {
        res.status(404).json({ success: false, message: 'Complaint not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Feedback recorded', data: complaint });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
