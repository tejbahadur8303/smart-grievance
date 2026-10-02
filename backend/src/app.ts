import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';

export function createApp(): express.Application {
  const app = express();

  // Security & logging middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
  app.use(cors({
    origin: '*',
    credentials: true
  }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(env.UPLOAD_DIR));

  // Root API Welcome & Directory endpoint
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      service: 'Smart Grievance Redressal & Tracking System for Villages API',
      status: 'ONLINE',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        apiBase: '/api/v1',
        auth: '/api/v1/auth',
        complaints: '/api/v1/complaints',
        welfare: '/api/v1/welfare',
        ration: '/api/v1/ration',
        workers: '/api/v1/workers',
        analytics: '/api/v1/analytics',
        escalations: '/api/v1/escalations'
      },
      dashboards: {
        districtAdminWeb: 'http://localhost:3000',
        panchayatOfficerWeb: 'http://localhost:3001'
      }
    });
  });

  // Health check endpoint (Required by specification)
  app.get('/health', (req: Request, res: Response) => {

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV
    });
  });

  // Versioned API routes
  app.use('/api/v1', apiRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
