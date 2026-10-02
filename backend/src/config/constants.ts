export enum UserRole {
  CITIZEN = 'CITIZEN',
  PANCHAYAT_OFFICER = 'PANCHAYAT_OFFICER',
  FIELD_WORKER = 'FIELD_WORKER',
  ADMIN = 'ADMIN'
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  REQUESTED_INFORMATION = 'REQUESTED_INFORMATION',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CITIZEN_VERIFICATION_PENDING = 'CITIZEN_VERIFICATION_PENDING',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  ESCALATED = 'ESCALATED'
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EscalationLevel {
  NONE = 'NONE',
  LEVEL_1 = 'LEVEL_1', // Panchayat Officer Alert
  LEVEL_2 = 'LEVEL_2', // Panchayat Head / Block Development Officer
  LEVEL_3 = 'LEVEL_3'  // District Magistrate / Admin
}

export const COMPLAINT_CATEGORIES = [
  'Roads & Potholes',
  'Streetlights & Electrical',
  'Water Supply & Leakage',
  'Drainage & Sewage',
  'Garbage & Sanitation',
  'Public Toilets',
  'Health Centre / Dispensary',
  'School & Anganwadi Infrastructure',
  'PDS / Ration Supply',
  'Welfare Schemes & Pensions',
  'Agriculture & Irrigation',
  'Livestock & Animal Welfare',
  'Public Safety & Encroachment',
  'Other'
] as const;

export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];

export const CATEGORY_DEPARTMENT_MAP: Record<string, string> = {
  'Roads & Potholes': 'Public Works Department (PWD)',
  'Streetlights & Electrical': 'Rural Electricity Board',
  'Water Supply & Leakage': 'Jal Sansthan / Water Supply',
  'Drainage & Sewage': 'Sanitation & Rural Development',
  'Garbage & Sanitation': 'Sanitation & Rural Development',
  'Public Toilets': 'Swachh Bharat Rural Cell',
  'Health Centre / Dispensary': 'Public Health & Family Welfare',
  'School & Anganwadi Infrastructure': 'Education & Child Welfare',
  'PDS / Ration Supply': 'Food & Civil Supplies (PDS)',
  'Welfare Schemes & Pensions': 'Social Welfare Department',
  'Agriculture & Irrigation': 'Agriculture & Minor Irrigation',
  'Livestock & Animal Welfare': 'Animal Husbandry & Veterinary',
  'Public Safety & Encroachment': 'Panchayat & Local Police',
  'Other': 'General Panchayat Administration'
};

export const DEFAULT_SLA_HOURS: Record<PriorityLevel, number> = {
  [PriorityLevel.CRITICAL]: 12,
  [PriorityLevel.HIGH]: 36,
  [PriorityLevel.MEDIUM]: 72,
  [PriorityLevel.LOW]: 144
};
