import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { getAiProvider } from '../providers/ai';
import { Complaint } from '../models/complaint.model';
import { WelfareScheme } from '../models/welfareScheme.model';

export class AiController {
  static async analyzeComplaint(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { text, villageContext } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, message: 'Text is required for AI analysis' });
        return;
      }

      const ai = getAiProvider();
      const analysis = await ai.analyzeComplaint(text, {
        villageContext: villageContext || req.user?.villageId?.toString()
      });

      res.status(200).json({
        success: true,
        message: 'AI analysis completed',
        data: analysis
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message is required' });
        return;
      }

      let recentComplaints: any[] = [];
      let availableSchemes: any[] = [];

      if (req.user) {
        const complaints = await Complaint.find({ citizenId: req.user._id })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('complaintId title status category updatedAt');
        
        recentComplaints = complaints.map(c => ({
          complaintId: c.complaintId,
          title: c.title,
          status: c.status,
          category: c.category,
          updatedAt: c.updatedAt
        }));
      }

      const schemes = await WelfareScheme.find({ isActive: true }).limit(5).select('name benefits requiredDocuments');
      availableSchemes = schemes.map(s => ({
        name: s.name,
        benefits: s.benefits,
        requiredDocuments: s.requiredDocuments
      }));

      const ai = getAiProvider();
      const reply = await ai.chat(message, {
        citizenName: req.user?.name,
        recentComplaints,
        availableSchemes
      });

      res.status(200).json({
        success: true,
        data: {
          reply,
          timestamp: new Date()
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
