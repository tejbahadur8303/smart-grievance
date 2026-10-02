import { PriorityLevel } from '../../config/constants';

export interface AiComplaintAnalysisResult {
  category: string;
  subcategory: string;
  department: string;
  priority: PriorityLevel;
  priorityScore: number;
  confidence: number;
  reason: string;
  suggestedSlaHours: number;
  possibleDuplicateComplaintIds: string[];
}

export interface AiChatContext {
  citizenName?: string;
  villageName?: string;
  recentComplaints?: Array<{
    complaintId: string;
    title: string;
    status: string;
    category: string;
    updatedAt: Date;
  }>;
  availableSchemes?: Array<{
    name: string;
    benefits: string;
    requiredDocuments: string[];
  }>;
}

export interface IAiProvider {
  analyzeComplaint(text: string, metadata?: { villageContext?: string; hasImage?: boolean }): Promise<AiComplaintAnalysisResult>;
  chat(message: string, context?: AiChatContext): Promise<string>;
}
