import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/users', AdminController.listUsers);
router.get('/sla-rules', AdminController.getSlaRules);
router.post('/sla-rules', AdminController.updateSlaRule);

export default router;
