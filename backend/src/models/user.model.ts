import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../config/constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  villageId?: Types.ObjectId;
  panchayatId?: Types.ObjectId;
  blockId?: Types.ObjectId;
  districtId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  languagePreference: 'hi' | 'en';
  isVerified: boolean;
  avatarUrl?: string;
  assignedTasksCount?: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CITIZEN,
      index: true
    },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village', index: true },
    panchayatId: { type: Schema.Types.ObjectId, ref: 'Panchayat', index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', index: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'District', index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    languagePreference: { type: String, enum: ['hi', 'en'], default: 'hi' },
    isVerified: { type: Boolean, default: true },
    avatarUrl: { type: String },
    assignedTasksCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
