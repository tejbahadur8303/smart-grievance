import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../config/constants';
import { User, IUser } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: UserRole };
    
    User.findById(decoded.userId).then((user) => {
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
          code: 'USER_NOT_FOUND'
        });
        return;
      }
      req.user = user;
      next();
    }).catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Database authentication check failed',
        code: 'AUTH_DB_ERROR'
      });
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' is not authorized.`,
        code: 'FORBIDDEN'
      });
      return;
    }

    next();
  };
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };
    User.findById(decoded.userId).then((user) => {
      if (user) req.user = user;
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}
