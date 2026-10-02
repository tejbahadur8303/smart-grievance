import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const panchayatId = req.query.panchayatId as string || req.user?.panchayatId?.toString();
      const villageId = req.query.villageId as string;
      const stats = await AnalyticsService.getOverviewStats(panchayatId, villageId);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getComplaintsByCategory();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByVillage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getComplaintsByVillage();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getComplaintsByDepartment();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getMonthlyTrends();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAiSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const summary = await AnalyticsService.getAiWeeklySummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
