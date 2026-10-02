import { Schema, model, Document, Types } from 'mongoose';

// 1. Fair Price Ration Shop
export interface IRationShop extends Document {
  _id: Types.ObjectId;
  shopCode: string;
  dealerName: string;
  contactPhone: string;
  villageId?: Types.ObjectId;
  villageName: string;
  panchayatId?: Types.ObjectId;
  panchayatName: string;
  activeCardHolders: number;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  isActive: boolean;
}

const rationShopSchema = new Schema<IRationShop>(
  {
    shopCode: { type: String, required: true, unique: true, index: true },
    dealerName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    villageId: { type: Schema.Types.ObjectId, ref: 'Village' },
    villageName: { type: String, required: true },
    panchayatId: { type: Schema.Types.ObjectId, ref: 'Panchayat' },
    panchayatName: { type: String, required: true },
    activeCardHolders: { type: Number, default: 450 },
    latitude: { type: Number },
    longitude: { type: Number },
    openingHours: { type: String, default: '09:00 AM - 05:00 PM (Closed Tuesday)' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const RationShop = model<IRationShop>('RationShop', rationShopSchema);

// 2. Ration Allocation per Shop
export interface IRationAllocation extends Document {
  _id: Types.ObjectId;
  shopId: Types.ObjectId;
  monthYear: string; // e.g. '2026-10'
  commodity: 'Wheat' | 'Rice' | 'Sugar' | 'Coarse Grain' | 'Kerosene';
  allocatedQuantityKg: number;
  distributedQuantityKg: number;
  unitPriceRs: number;
  status: 'ACTIVE' | 'COMPLETED';
}

const rationAllocationSchema = new Schema<IRationAllocation>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'RationShop', required: true, index: true },
    monthYear: { type: String, required: true, index: true },
    commodity: {
      type: String,
      enum: ['Wheat', 'Rice', 'Sugar', 'Coarse Grain', 'Kerosene'],
      required: true
    },
    allocatedQuantityKg: { type: Number, required: true },
    distributedQuantityKg: { type: Number, default: 0 },
    unitPriceRs: { type: Number, default: 2.0 },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' }
  },
  { timestamps: true }
);

export const RationAllocation = model<IRationAllocation>('RationAllocation', rationAllocationSchema);

// 3. Citizen Entitlement & Distribution Record
export interface IRationDistribution extends Document {
  _id: Types.ObjectId;
  citizenId: Types.ObjectId;
  maskedCardNumber: string; // e.g. 'UP-AAY-****-9421'
  familyMembersCount: number;
  monthYear: string;
  shopId: Types.ObjectId;
  commodity: string;
  entitledQuantityKg: number;
  distributedQuantityKg: number;
  distributedDate?: Date;
  isDiscrepancyFlagged: boolean;
  status: 'DISTRIBUTED' | 'PENDING' | 'DISCREPANCY';
}

const rationDistributionSchema = new Schema<IRationDistribution>(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    maskedCardNumber: { type: String, required: true },
    familyMembersCount: { type: Number, default: 4 },
    monthYear: { type: String, required: true, index: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'RationShop', required: true },
    commodity: { type: String, required: true },
    entitledQuantityKg: { type: Number, required: true },
    distributedQuantityKg: { type: Number, default: 0 },
    distributedDate: { type: Date },
    isDiscrepancyFlagged: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['DISTRIBUTED', 'PENDING', 'DISCREPANCY'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

export const RationDistribution = model<IRationDistribution>('RationDistribution', rationDistributionSchema);

// 4. Ration Grievance Reports (Short quantity, Shop closed, Overcharging, etc.)
export interface IRationGrievance extends Document {
  _id: Types.ObjectId;
  citizenId: Types.ObjectId;
  citizenName: string;
  citizenPhone: string;
  shopId: Types.ObjectId;
  shopCode: string;
  grievanceType: 'SHORT_QUANTITY' | 'SHOP_CLOSED' | 'OVERCHARGING' | 'BIOMETRIC_ISSUE' | 'RATION_NOT_GIVEN' | 'OTHER';
  description: string;
  complaintId?: Types.ObjectId; // Linked formal grievance
  status: 'SUBMITTED' | 'INVESTIGATING' | 'RESOLVED';
  createdAt: Date;
}

const rationGrievanceSchema = new Schema<IRationGrievance>(
  {
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    citizenName: { type: String, required: true },
    citizenPhone: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'RationShop', required: true, index: true },
    shopCode: { type: String, required: true },
    grievanceType: {
      type: String,
      enum: ['SHORT_QUANTITY', 'SHOP_CLOSED', 'OVERCHARGING', 'BIOMETRIC_ISSUE', 'RATION_NOT_GIVEN', 'OTHER'],
      required: true
    },
    description: { type: String, required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    status: {
      type: String,
      enum: ['SUBMITTED', 'INVESTIGATING', 'RESOLVED'],
      default: 'SUBMITTED'
    }
  },
  { timestamps: true }
);

export const RationGrievance = model<IRationGrievance>('RationGrievance', rationGrievanceSchema);
