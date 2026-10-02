import { Schema, model, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Department = model<IDepartment>('Department', departmentSchema);
