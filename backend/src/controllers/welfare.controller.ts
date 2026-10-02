import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { WelfareService } from '../services/welfare.service';
import { UserRole } from '../config/constants';
import { getStorageProvider } from '../providers/storage';

export class WelfareController {
  static async listSchemes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const schemes = await WelfareService.getSchemes(req.query.all !== 'true');
      res.status(200).json({ success: true, data: schemes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createScheme(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const scheme = await WelfareService.createScheme(req.body, req.user!);
      res.status(201).json({ success: true, message: 'Scheme created', data: scheme });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async apply(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const storage = getStorageProvider();
      const documentsUploaded: string[] = [];

      if (files && Array.isArray(files)) {
        for (const file of files) {
          const uploaded = await storage.uploadFile(file);
          documentsUploaded.push(uploaded.url);
        }
      }
      if (req.body.documents && Array.isArray(req.body.documents)) {
        documentsUploaded.push(...req.body.documents);
      }

      const application = await WelfareService.applyForScheme(req.user!, {
        schemeId: req.body.schemeId,
        annualIncome: req.body.annualIncome ? parseFloat(req.body.annualIncome) : undefined,
        category: req.body.category,
        documentsUploaded
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: any = {};
      if (req.user?.role === UserRole.CITIZEN) {
        query.citizenId = req.user._id.toString();
      } else if (req.user?.role === UserRole.PANCHAYAT_OFFICER && req.user.panchayatId) {
        query.panchayatId = req.user.panchayatId.toString();
      }
      if (req.query.status) query.status = req.query.status as string;

      const applications = await WelfareService.getApplications(query);
      res.status(200).json({ success: true, data: applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async reviewApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { decision, remarks } = req.body;
      const app = await WelfareService.reviewApplication(
        req.params.id as string,
        req.user!,
        decision,
        remarks || 'Application reviewed by officer.'
      );
      res.status(200).json({ success: true, message: `Application ${decision}`, data: app });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
