import { Types } from 'mongoose';
import { Notification, INotification } from '../../models/notification.model';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function setSocketIO(io: SocketIOServer) {
  ioInstance = io;
}

export interface SendNotificationParams {
  recipientId: Types.ObjectId | string;
  title: string;
  message: string;
  type?: 'COMPLAINT_UPDATE' | 'TASK_ASSIGNED' | 'TASK_RESOLVED' | 'ESCALATION' | 'WELFARE_UPDATE' | 'RATION_UPDATE' | 'GENERAL';
  relatedComplaintId?: Types.ObjectId | string;
  relatedComplaintCode?: string;
}

export class NotificationService {
  static async send(params: SendNotificationParams): Promise<INotification> {
    const notif = await Notification.create({
      recipientId: params.recipientId,
      title: params.title,
      message: params.message,
      type: params.type || 'GENERAL',
      relatedComplaintId: params.relatedComplaintId,
      relatedComplaintCode: params.relatedComplaintCode,
      isRead: false
    });

    // Real-time WebSocket delivery to recipient room
    if (ioInstance) {
      ioInstance.to(params.recipientId.toString()).emit('notification', notif);
      ioInstance.emit('global_activity', {
        title: params.title,
        message: params.message,
        type: params.type,
        timestamp: new Date()
      });
    }

    console.log(`[Notification] Sent to User ${params.recipientId}: "${params.title}" - ${params.message}`);
    return notif;
  }
}
