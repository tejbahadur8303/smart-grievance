import { Schema, model, Document, Types } from 'mongoose';
import { PriorityLevel } from '../config/constants';

export interface ISlaRule extends Document {
  _id: Types.ObjectId;
  category: string;
  priority: PriorityLevel;
  maxResolutionHours: number;
  level1EscalationHours: number; // Alert to Officer
  level2EscalationHours: number; // Alert to Panchayat BDO
  level3EscalationHours: number; // Alert to District Magistrate
}

const slaRuleSchema = new Schema<ISlaRule>(
  {
    category: { type: String, required: true },
    priority: { type: String, enum: Object.values(PriorityLevel), required: true },
    maxResolutionHours: { type: Number, required: true },
    level1EscalationHours: { type: Number, required: true },
    level2EscalationHours: { type: Number, required: true },
    level3EscalationHours: { type: Number, required: true }
  },
  { timestamps: true }
);

slaRuleSchema.index({ category: 1, priority: 1 }, { unique: true });

export const SlaRule = model<ISlaRule>('SlaRule', slaRuleSchema);
