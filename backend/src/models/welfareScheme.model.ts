import { Schema, model, Document, Types } from 'mongoose';

export interface IWelfareScheme extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  hindiName?: string;
  department: string;
  description: string;
  eligibilityCriteria: string[];
  benefits: string;
  requiredDocuments: string[];
  applicationPeriod?: string;
  financialAssistanceAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const welfareSchemeSchema = new Schema<IWelfareScheme>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    hindiName: { type: String, trim: true },
    department: { type: String, required: true },
    description: { type: String, required: true },
    eligibilityCriteria: { type: [String], default: [] },
    benefits: { type: String, required: true },
    requiredDocuments: { type: [String], default: [] },
    applicationPeriod: { type: String },
    financialAssistanceAmount: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const WelfareScheme = model<IWelfareScheme>('WelfareScheme', welfareSchemeSchema);
