export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CITIZEN' | 'PANCHAYAT_OFFICER' | 'FIELD_WORKER' | 'ADMIN';
  villageId?: any;
  panchayatId?: any;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  source: 'TEXT' | 'VOICE';
  transcript?: string;
  category: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priorityScore: number;
  aiConfidence: number;
  aiReasoning?: string;
  status: string;
  villageName?: string;
  panchayatName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  landmark?: string;
  images: string[];
  affectedPeopleEstimate: number;
  publicSafetyRisk: boolean;
  deadline?: string;
  escalationLevel: string;
  isCitizenVerified?: boolean;
  citizenRating?: number;
  citizenFeedback?: string;
  isReopened: boolean;
  reopenReason?: string;
  citizenId?: { name: string; phone: string };
  assignedWorkerId?: { name: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

export interface OverviewStats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
  closed: number;
  reopened: number;
  escalated: number;
  overdueCount: number;
  avgResolutionHours: number;
  resolutionRate: number;
  welfareTotal: number;
  rationDiscrepancies: number;
}
