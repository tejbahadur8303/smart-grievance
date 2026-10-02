import { GoogleGenAI } from '@google/genai';
import { IAiProvider, AiComplaintAnalysisResult, AiChatContext } from './ai.provider.interface';
import { DeterministicRulesAiProvider } from './rules.provider';
import { env } from '../../config/env';
import { PriorityLevel, COMPLAINT_CATEGORIES, CATEGORY_DEPARTMENT_MAP } from '../../config/constants';

export class GeminiAiProvider implements IAiProvider {
  private fallbackProvider = new DeterministicRulesAiProvider();
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  async analyzeComplaint(
    text: string,
    metadata?: { villageContext?: string; hasImage?: boolean }
  ): Promise<AiComplaintAnalysisResult> {
    if (!this.client || !env.GEMINI_API_KEY) {
      return this.fallbackProvider.analyzeComplaint(text, metadata);
    }

    try {
      const prompt = `You are an AI assistant for a rural Indian Village Grievance Redressal System.
Analyze this civic complaint submitted by a rural citizen (may be in Hindi, English, or Hinglish):
"${text}"

Categories: ${JSON.stringify(COMPLAINT_CATEGORIES)}

Respond STRICTLY in valid JSON matching this exact structure:
{
  "category": "one of the above categories",
  "subcategory": "short subcategory name",
  "department": "responsible department",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priorityScore": number between 10 and 100,
  "confidence": number between 0.5 and 0.99,
  "reason": "short explanation for why this priority and category was chosen",
  "suggestedSlaHours": number of hours to resolve
}

Safety rule: Fallen electrical live wires, deep open manholes, contaminated drinking water epidemics must be CRITICAL.`;

      const response = await this.client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: prompt
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const category = COMPLAINT_CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';
      const department = CATEGORY_DEPARTMENT_MAP[category] || parsed.department || 'General Administration';

      return {
        category,
        subcategory: parsed.subcategory || 'General',
        department,
        priority: [PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH, PriorityLevel.CRITICAL].includes(parsed.priority)
          ? parsed.priority
          : PriorityLevel.MEDIUM,
        priorityScore: parsed.priorityScore || 50,
        confidence: parsed.confidence || 0.9,
        reason: parsed.reason || 'AI analysis completed.',
        suggestedSlaHours: parsed.suggestedSlaHours || 48,
        possibleDuplicateComplaintIds: []
      };
    } catch (err: any) {
      console.warn(`[GeminiAiProvider] Falling back to deterministic rules: ${err.message}`);
      return this.fallbackProvider.analyzeComplaint(text, metadata);
    }
  }

  async chat(message: string, context?: AiChatContext): Promise<string> {
    if (!this.client || !env.GEMINI_API_KEY) {
      return this.fallbackProvider.chat(message, context);
    }

    try {
      const systemContext = `You are "Gramin Sahayak", an empathetic, respectful, and helpful AI assistant for Indian village citizens.
Citizen Name: ${context?.citizenName || 'Nagrik'}
Village: ${context?.villageName || 'Gram Panchayat'}
Recent Complaints: ${JSON.stringify(context?.recentComplaints || [])}
Available Schemes: ${JSON.stringify(context?.availableSchemes || [])}

Rules:
1. Always respond in simple, polite Hindi or Hinglish (or English if the user asked in English).
2. Help them track complaints, report issues, understand ration entitlements and government schemes.
3. NEVER make up government approvals or legal promises.
4. Keep answers concise and readable on a mobile screen.`;

      const response = await this.client.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: `${systemContext}\n\nCitizen: ${message}\nAssistant:`
      });

      return response.text || 'Maaf kijiye, main abhi uttar nahi de pa raha hoon. Kripya thodi der baad prayas karein.';
    } catch (err: any) {
      console.warn(`[GeminiAiProvider] Chat fallback: ${err.message}`);
      return this.fallbackProvider.chat(message, context);
    }
  }
}
