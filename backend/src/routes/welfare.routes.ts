import { Router } from 'express';
import { WelfareController } from '../controllers/welfare.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Browse welfare schemes
router.get('/schemes', WelfareController.listSchemes);

// Admin creates welfare scheme
router.post('/schemes', authenticate, authorize(UserRole.ADMIN), WelfareController.createScheme);

// Citizen applies for scheme
router.post(
  '/apply',
  authenticate,
  authorize(UserRole.CITIZEN),
  upload.array('documents', 5),
  WelfareController.apply
);

// List welfare applications
router.get('/applications', authenticate, WelfareController.listApplications);

// Officer reviews/approves application
router.post(
  '/applications/:id/review',
  authenticate,
  authorize(UserRole.PANCHAYAT_OFFICER, UserRole.ADMIN),
  WelfareController.reviewApplication
);

export default router;
