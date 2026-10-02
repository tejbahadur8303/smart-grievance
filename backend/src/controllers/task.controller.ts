import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { WorkerService } from '../services/worker.service';
import { getStorageProvider } from '../providers/storage';

export class TaskController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const tasks = await WorkerService.getTasks(req.user!._id.toString(), status);
      res.status(200).json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async accept(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const task = await WorkerService.acceptTask(req.params.id as string, req.user!);
      res.status(200).json({ success: true, message: 'Task accepted', data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async reject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      const task = await WorkerService.rejectTask(req.params.id as string, req.user!, reason || 'Unable to attend');
      res.status(200).json({ success: true, message: 'Task rejected', data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async startWork(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const storage = getStorageProvider();
      const beforePhotos: string[] = [];

      if (files && Array.isArray(files)) {
        for (const file of files) {
          const uploaded = await storage.uploadFile(file);
          beforePhotos.push(uploaded.url);
        }
      }
      if (req.body.beforePhotos && Array.isArray(req.body.beforePhotos)) {
        beforePhotos.push(...req.body.beforePhotos);
      }

      const task = await WorkerService.startWork(req.params.id as string, req.user!, beforePhotos);
      res.status(200).json({ success: true, message: 'Work started', data: task });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async completeTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const storage = getStorageProvider();
      const afterPhotos: string[] = [];

      if (files && Array.isArray(files)) {
        for (const file of files) {
          const uploaded = await storage.uploadFile(file);
          afterPhotos.push(uploaded.url);
        }
      }
      if (req.body.afterPhotos && Array.isArray(req.body.afterPhotos)) {
        afterPhotos.push(...req.body.afterPhotos);
      }

      const notes = req.body.completionNotes || 'Work completed successfully.';
      const proofLocation = (req.body.latitude && req.body.longitude) ? {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      } : undefined;

      const task = await WorkerService.completeTask(
        req.params.id as string,
        req.user!,
        afterPhotos,
        notes,
        proofLocation
      );

      res.status(200).json({
        success: true,
        message: 'Task completed. Citizen notified for verification.',
        data: task
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
