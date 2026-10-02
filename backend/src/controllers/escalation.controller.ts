import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EscalationService } from '../services/escalation.service';
import { Complaint } from '../models/complaint.model';
import { ComplaintStatus } from '../config/constants';

export class EscalationController {
  static async triggerCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await EscalationService.checkAndEscalateComplaints();
      res.status(200).json({
        success: true,
        message: `SLA escalation job completed. ${result.escalatedCount} complaints escalated.`,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: any = {
        $or: [
          { status: ComplaintStatus.ESCALATED },
          { escalationLevel: { $ne: 'NONE' } }
        ]
      };

      if (req.user?.panchayatId) {
        query.panchayatId = req.user.panchayatId;
      }

      const items = await Complaint.find(query)
        .sort({ updatedAt: -1 })
        .populate('citizenId', 'name phone')
        .populate('assignedWorkerId', 'name phone');

      res.status(200).json({ success: true, data: items });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
