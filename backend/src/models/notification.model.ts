import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: 'COMPLAINT_UPDATE' | 'TASK_ASSIGNED' | 'TASK_RESOLVED' | 'ESCALATION' | 'WELFARE_UPDATE' | 'RATION_UPDATE' | 'GENERAL';
  relatedComplaintId?: Types.ObjectId;
  relatedComplaintCode?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['COMPLAINT_UPDATE', 'TASK_ASSIGNED', 'TASK_RESOLVED', 'ESCALATION', 'WELFARE_UPDATE', 'RATION_UPDATE', 'GENERAL'],
      default: 'GENERAL'
    },
    relatedComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    relatedComplaintCode: { type: String },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
