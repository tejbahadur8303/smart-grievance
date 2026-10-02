import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintRoutes from './complaint.routes';
import taskRoutes from './task.routes';
import voiceRoutes from './voice.routes';
import aiRoutes from './ai.routes';
import welfareRoutes from './welfare.routes';
import rationRoutes from './ration.routes';
import escalationRoutes from './escalation.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import villageRoutes from './village.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/tasks', taskRoutes);
router.use('/voice', voiceRoutes);
router.use('/ai', aiRoutes);
router.use('/welfare', welfareRoutes);
router.use('/ration', rationRoutes);
router.use('/escalations', escalationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/villages', villageRoutes);
router.use('/admin', adminRoutes);

export default router;
