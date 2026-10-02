import { Schema, model, Document, Types } from 'mongoose';

// District
export interface IDistrict extends Document {
  _id: Types.ObjectId;
  name: string;
  state: string;
  code: string;
}

const districtSchema = new Schema<IDistrict>(
  {
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Uttar Pradesh' },
    code: { type: String, required: true, unique: true, uppercase: true }
  },
  { timestamps: true }
);

export const District = model<IDistrict>('District', districtSchema);

// Block
export interface IBlock extends Document {
  _id: Types.ObjectId;
  name: string;
  districtId: Types.ObjectId;
  code: string;
}

const blockSchema = new Schema<IBlock>(
  {
    name: { type: String, required: true, trim: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
    code: { type: String, required: true, uppercase: true }
  },
  { timestamps: true }
);

export const Block = model<IBlock>('Block', blockSchema);

// Panchayat
export interface IPanchayat extends Document {
  _id: Types.ObjectId;
  name: string;
  blockId: Types.ObjectId;
  districtId: Types.ObjectId;
  code: string;
}

const panchayatSchema = new Schema<IPanchayat>(
  {
    name: { type: String, required: true, trim: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
    code: { type: String, required: true, uppercase: true }
  },
  { timestamps: true }
);

export const Panchayat = model<IPanchayat>('Panchayat', panchayatSchema);

// Village
export interface IVillage extends Document {
  _id: Types.ObjectId;
  name: string;
  panchayatId: Types.ObjectId;
  blockId: Types.ObjectId;
  districtId: Types.ObjectId;
  population?: number;
  latitude?: number;
  longitude?: number;
  code: string;
}

const villageSchema = new Schema<IVillage>(
  {
    name: { type: String, required: true, trim: true },
    panchayatId: { type: Schema.Types.ObjectId, ref: 'Panchayat', required: true, index: true },
    blockId: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
    population: { type: Number, default: 1500 },
    latitude: { type: Number },
    longitude: { type: Number },
    code: { type: String, required: true, uppercase: true }
  },
  { timestamps: true }
);

export const Village = model<IVillage>('Village', villageSchema);
