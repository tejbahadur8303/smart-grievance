import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN, UserRole.PANCHAYAT_OFFICER));

router.get('/overview', AnalyticsController.getOverview);
router.get('/complaints-by-category', AnalyticsController.getByCategory);
router.get('/complaints-by-village', AnalyticsController.getByVillage);
router.get('/complaints-by-department', AnalyticsController.getByDepartment);
router.get('/trends', AnalyticsController.getTrends);
router.get('/ai-summary', AnalyticsController.getAiSummary);

export default router;
