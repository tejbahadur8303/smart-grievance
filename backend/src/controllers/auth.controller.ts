import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { UserRole } from '../config/constants';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await AuthService.register(req.body, req.ip);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: result.user._id,
            name: result.user.name,
            phone: result.user.phone,
            role: result.user.role,
            villageId: result.user.villageId,
            panchayatId: result.user.panchayatId,
            languagePreference: result.user.languagePreference
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }

  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { phone, password } = req.body;
      const result = await AuthService.login(phone, password, req.ip);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: result.user._id,
            name: result.user.name,
            phone: result.user.phone,
            role: result.user.role,
            villageId: result.user.villageId,
            panchayatId: result.user.panchayatId,
            departmentId: result.user.departmentId,
            languagePreference: result.user.languagePreference
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }

  static async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token required' });
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Tokens refreshed',
        data: tokens
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
        code: 'REFRESH_FAILED'
      });
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!._id.toString());
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listWorkers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: any = { role: UserRole.FIELD_WORKER };
      if (req.user?.panchayatId) {
        query.panchayatId = req.user.panchayatId;
      }
      let workers = await User.find(query).select('name phone assignedTasksCount villageId panchayatId');
      if (workers.length === 0) {
        // Fallback: return any available field workers in the system so assignments are never blocked
        workers = await User.find({ role: UserRole.FIELD_WORKER }).select('name phone assignedTasksCount villageId panchayatId');
      }
      res.status(200).json({
        success: true,
        data: workers
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
