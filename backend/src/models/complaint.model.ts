import { Schema, model, Document, Types } from 'mongoose';
import { ComplaintStatus, PriorityLevel, EscalationLevel } from '../config/constants';

export interface IComplaint extends Document {
  _id: Types.ObjectId;
  complaintId: string;
  citizenId: Types.ObjectId;
  title: string;
  description: string;
  source: 'TEXT' | 'VOICE';
  audioUrl?: string;
  transcript?: string;
  category: string;
  subcategory?: string;
  department: string;
  departmentId?: Types.ObjectId;
  priority: PriorityLevel;
  priorityScore: number; // 0 - 100
  aiConfidence: number; // 0 - 1
  aiReasoning?: string;
  status: ComplaintStatus;
  
  // Location
  villageId?: Types.ObjectId;
  villageName?: string;
  panchayatId?: Types.ObjectId;
  panchayatName?: string;
  blockId?: Types.ObjectId;
  districtId?: Types.ObjectId;
  latitude?: number;
  longitude?: number;
  address?: string;
  landmark?: string;
  location?: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };

  // Media
  images: string[];
  videos: string[];
  documents: string[];

  // Impact
  affectedPeopleEstimate: number;
  publicSafetyRisk: boolean;

  // Assignment
  assignedOfficerId?: Types.ObjectId;
  assignedWorkerId?: Types.ObjectId;
  deadline?: Date;
  escalationLevel: EscalationLevel;

  // Verification & Feedback
  isCitizenVerified?: boolean;
  citizenVerifiedAt?: Date;
  citizenFeedback?: string;
  citizenRating?: number; // 1 to 5
  isReopened: boolean;
  reopenReason?: string;
  reopenedAt?: Date;

  // Duplicate detection
  duplicateOf?: Types.ObjectId;
  possibleDuplicates?: Array<{
    complaintId: string;
    score: number;
    title: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    source: { type: String, enum: ['TEXT', 'VOICE'], default: 'TEXT' },
    audioUrl: { type: String },
    transcript: { type: String },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    department: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    priority: {
      type: String,
      enum: Object.values(PriorityLevel),
      default: PriorityLevel.MEDIUM,
      index: true
    },
    priorityScore: { type: Number, default: 50 },
    aiConfidence: { type: Number, default: 0.85 },
    aiReasoning: { type: String },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.SUBMITTED,
      index: true
    },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village', index: true },
    villageName: { type: String },
    panchayatId: { type: Schema.Types.ObjectId, ref: 'Panchayat', index: true },
    panchayatName: { type: String },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block' },
    districtId: { type: Schema.Types.ObjectId, ref: 'District' },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    landmark: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    affectedPeopleEstimate: { type: Number, default: 10 },
    publicSafetyRisk: { type: Boolean, default: false },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date },
    escalationLevel: {
      type: String,
      enum: Object.values(EscalationLevel),
      default: EscalationLevel.NONE,
      index: true
    },
    isCitizenVerified: { type: Boolean, default: false },
    citizenVerifiedAt: { type: Date },
    citizenFeedback: { type: String },
    citizenRating: { type: Number, min: 1, max: 5 },
    isReopened: { type: Boolean, default: false },
    reopenReason: { type: String },
    reopenedAt: { type: Date },
    duplicateOf: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    possibleDuplicates: [
      {
        complaintId: { type: String },
        score: { type: Number },
        title: { type: String }
      }
    ],
    resolvedAt: { type: Date },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

complaintSchema.index({ 'location': '2dsphere' });
complaintSchema.index({ createdAt: -1 });

export const Complaint = model<IComplaint>('Complaint', complaintSchema);
