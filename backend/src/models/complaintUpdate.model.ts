import { Schema, model, Document, Types } from 'mongoose';
import { ComplaintStatus } from '../config/constants';

export interface IComplaintUpdate extends Document {
  _id: Types.ObjectId;
  complaintId: Types.ObjectId;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedById: Types.ObjectId;
  changedByName: string;
  changedByRole: string;
  message: string;
  notes?: string;
  proofImages?: string[];
  proofVideos?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

const complaintUpdateSchema = new Schema<IComplaintUpdate>(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    previousStatus: { type: String, enum: Object.values(ComplaintStatus), required: true },
    newStatus: { type: String, enum: Object.values(ComplaintStatus), required: true },
    changedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String, required: true },
    changedByRole: { type: String, required: true },
    message: { type: String, required: true },
    notes: { type: String },
    proofImages: { type: [String], default: [] },
    proofVideos: { type: [String], default: [] },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  { timestamps: true }
);

export const ComplaintUpdate = model<IComplaintUpdate>('ComplaintUpdate', complaintUpdateSchema);
