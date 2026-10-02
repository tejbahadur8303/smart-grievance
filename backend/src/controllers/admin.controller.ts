import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuditLog } from '../models/auditLog.model';
import { User } from '../models/user.model';
import { SlaRule } from '../models/slaRule.model';
import { Village, Panchayat, Block, District } from '../models/location.model';

export class AdminController {
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments()
      ]);

      res.status(200).json({
        success: true,
        data: logs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, search } = req.query;
      const filter: any = {};
      if (role) filter.role = role;
      if (search) {
        const regex = new RegExp(search as string, 'i');
        filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
      }

      const users = await User.find(filter)
        .select('-passwordHash')
        .populate('villageId', 'name')
        .populate('panchayatId', 'name')
        .populate('departmentId', 'name')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSlaRules(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rules = await SlaRule.find().sort({ priority: 1 });
      res.status(200).json({ success: true, data: rules });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateSlaRule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { category, priority, maxResolutionHours, level1EscalationHours, level2EscalationHours, level3EscalationHours } = req.body;
      const rule = await SlaRule.findOneAndUpdate(
        { category, priority },
        { maxResolutionHours, level1EscalationHours, level2EscalationHours, level3EscalationHours },
        { upsert: true, new: true }
      );
      res.status(200).json({ success: true, message: 'SLA rule updated', data: rule });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
