import { Schema, model, Document, Types } from 'mongoose';
import { PriorityLevel } from '../config/constants';

export enum TaskStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface IWorkerTask extends Document {
  _id: Types.ObjectId;
  taskId: string;
  complaintId: Types.ObjectId;
  complaintCode: string;
  workerId: Types.ObjectId;
  assignedById: Types.ObjectId;
  title: string;
  instructions?: string;
  category: string;
  priority: PriorityLevel;
  villageName?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  status: TaskStatus;
  rejectionReason?: string;
  deadline?: Date;
  startedAt?: Date;
  completedAt?: Date;
  beforePhotos: string[];
  afterPhotos: string[];
  completionNotes?: string;
  proofLocation?: {
    latitude: number;
    longitude: number;
    recordedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const workerTaskSchema = new Schema<IWorkerTask>(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    complaintCode: { type: String, required: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    instructions: { type: String },
    category: { type: String, required: true },
    priority: { type: String, enum: Object.values(PriorityLevel), default: PriorityLevel.MEDIUM },
    villageName: { type: String },
    landmark: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.ASSIGNED,
      index: true
    },
    rejectionReason: { type: String },
    deadline: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    beforePhotos: { type: [String], default: [] },
    afterPhotos: { type: [String], default: [] },
    completionNotes: { type: String },
    proofLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      recordedAt: { type: Date }
    }
  },
  { timestamps: true }
);

export const WorkerTask = model<IWorkerTask>('WorkerTask', workerTaskSchema);
