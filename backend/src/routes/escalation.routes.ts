import { Router } from 'express';
import { EscalationController } from '../controllers/escalation.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Trigger auto-escalation check (for cron job, test or admin)
router.post('/check', authenticate, authorize(UserRole.ADMIN, UserRole.PANCHAYAT_OFFICER), EscalationController.triggerCheck);

// List escalated complaints
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.PANCHAYAT_OFFICER), EscalationController.list);

export default router;
