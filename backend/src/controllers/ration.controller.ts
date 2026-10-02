import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { RationService } from '../services/ration.service';

export class RationController {
  static async listShops(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const panchayatId = req.query.panchayatId as string || req.user?.panchayatId?.toString();
      const shops = await RationService.getShops(panchayatId);
      res.status(200).json({ success: true, data: shops });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getShopAllocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const shopId = req.params.shopId as string;
      const monthYear = req.query.monthYear as string;
      const allocations = await RationService.getShopAllocations(shopId, monthYear);
      res.status(200).json({ success: true, data: allocations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async myDistributions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const distributions = await RationService.getCitizenDistributions(req.user!._id.toString());
      res.status(200).json({ success: true, data: distributions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async reportGrievance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { shopId, grievanceType, description } = req.body;
      const result = await RationService.reportGrievance(req.user!, {
        shopId,
        grievanceType,
        description
      });
      res.status(201).json({
        success: true,
        message: 'Ration grievance registered and routed to grievance redressal pipeline.',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listGrievances(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const shopId = req.query.shopId as string;
      const grievances = await RationService.getGrievances(shopId);
      res.status(200).json({ success: true, data: grievances });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
