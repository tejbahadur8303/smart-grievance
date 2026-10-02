import { Complaint, IComplaint } from '../models/complaint.model';
import { ComplaintUpdate } from '../models/complaintUpdate.model';
import { User } from '../models/user.model';
import { ComplaintStatus, EscalationLevel, UserRole } from '../config/constants';
import { NotificationService } from '../providers/notifications/notification.service';
import { AuditService } from './audit.service';

export class EscalationService {
  static async checkAndEscalateComplaints(): Promise<{
    scanned: number;
    escalatedCount: number;
    escalatedComplaints: string[];
  }> {
    const now = new Date();
    // Overdue query
    const overdueComplaints = await Complaint.find({
      status: {
        $in: [
          ComplaintStatus.SUBMITTED,
          ComplaintStatus.UNDER_REVIEW,
          ComplaintStatus.VERIFIED,
          ComplaintStatus.ASSIGNED,
          ComplaintStatus.IN_PROGRESS,
          ComplaintStatus.REOPENED,
          ComplaintStatus.ESCALATED
        ]
      },
      deadline: { $lt: now }
    });

    const escalatedCodes: string[] = [];

    // Find admins to alert
    const admins = await User.find({ role: UserRole.ADMIN });

    for (const complaint of overdueComplaints) {
      const overdueMs = now.getTime() - (complaint.deadline ? complaint.deadline.getTime() : now.getTime());
      const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));

      let targetLevel = EscalationLevel.LEVEL_1;
      if (overdueHours >= 48) {
        targetLevel = EscalationLevel.LEVEL_3;
      } else if (overdueHours >= 24) {
        targetLevel = EscalationLevel.LEVEL_2;
      }

      // Check if level has escalated or status wasn't marked ESCALATED yet
      if (complaint.escalationLevel !== targetLevel || complaint.status !== ComplaintStatus.ESCALATED) {
        const oldStatus = complaint.status;
        const oldLevel = complaint.escalationLevel;

        complaint.status = ComplaintStatus.ESCALATED;
        complaint.escalationLevel = targetLevel;
        await complaint.save();

        await ComplaintUpdate.create({
          complaintId: complaint._id,
          previousStatus: oldStatus,
          newStatus: ComplaintStatus.ESCALATED,
          changedByName: 'SLA Auto-Escalation Engine',
          changedByRole: 'SYSTEM_SCHEDULER',
          changedById: admins[0]?._id || complaint.citizenId,
          message: `Complaint SLA Breached: Overdue by ${overdueHours} hours. Auto-escalated from ${oldLevel} to ${targetLevel}.`,
          notes: `Category: ${complaint.category} | Priority: ${complaint.priority} | Village: ${complaint.villageName}`
        });

        // Notify Assigned Officer
        if (complaint.assignedOfficerId) {
          await NotificationService.send({
            recipientId: complaint.assignedOfficerId,
            title: `SLA BREACH: ${complaint.complaintId} Escalated to ${targetLevel}`,
            message: `Grievance in ${complaint.villageName} is overdue by ${overdueHours} hours. Immediate resolution needed.`,
            type: 'ESCALATION',
            relatedComplaintId: complaint._id,
            relatedComplaintCode: complaint.complaintId
          });
        }

        // Notify Admins
        for (const admin of admins) {
          await NotificationService.send({
            recipientId: admin._id,
            title: `ADMIN ALERT: ${complaint.complaintId} at ${targetLevel}`,
            message: `SLA violation (${overdueHours}h overdue) for ${complaint.title} in ${complaint.villageName}.`,
            type: 'ESCALATION',
            relatedComplaintId: complaint._id,
            relatedComplaintCode: complaint.complaintId
          });
        }

        await AuditService.log({
          actorName: 'SLA Engine',
          actorRole: 'SYSTEM',
          action: 'COMPLAINT_ESCALATED',
          resource: 'Complaint',
          resourceId: complaint.complaintId,
          details: { overdueHours, level: targetLevel, oldLevel }
        });

        escalatedCodes.push(complaint.complaintId);
      }
    }

    return {
      scanned: overdueComplaints.length,
      escalatedCount: escalatedCodes.length,
      escalatedComplaints: escalatedCodes
    };
  }
}
