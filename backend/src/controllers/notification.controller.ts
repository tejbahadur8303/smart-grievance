import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifications = await Notification.find({ recipientId: req.user!._id })
        .sort({ createdAt: -1 })
        .limit(50);
      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user!._id },
        { isRead: true }
      );
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await Notification.updateMany(
        { recipientId: req.user!._id, isRead: false },
        { isRead: true }
      );
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
