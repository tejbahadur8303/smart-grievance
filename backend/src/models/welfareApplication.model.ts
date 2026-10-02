import { Schema, model, Document, Types } from 'mongoose';

export enum WelfareApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_VERIFICATION = 'UNDER_VERIFICATION',
  DOCUMENTS_REQUESTED = 'DOCUMENTS_REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface IWelfareApplication extends Document {
  _id: Types.ObjectId;
  applicationId: string;
  schemeId: Types.ObjectId;
  schemeName: string;
  citizenId: Types.ObjectId;
  applicantName: string;
  applicantPhone: string;
  villageName?: string;
  villageId?: Types.ObjectId;
  panchayatId?: Types.ObjectId;
  category?: string;
  annualIncome?: number;
  documentsUploaded: string[];
  status: WelfareApplicationStatus;
  officerRemarks?: string;
  verifiedById?: Types.ObjectId;
  verifiedByName?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const welfareApplicationSchema = new Schema<IWelfareApplication>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    schemeId: { type: Schema.Types.ObjectId, ref: 'WelfareScheme', required: true, index: true },
    schemeName: { type: String, required: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicantName: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    villageName: { type: String },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village' },
    panchayatId: { type: Schema.Types.ObjectId, ref: 'Panchayat' },
    category: { type: String, default: 'General' },
    annualIncome: { type: Number },
    documentsUploaded: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(WelfareApplicationStatus),
      default: WelfareApplicationStatus.SUBMITTED,
      index: true
    },
    officerRemarks: { type: String },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedByName: { type: String },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

export const WelfareApplication = model<IWelfareApplication>('WelfareApplication', welfareApplicationSchema);
