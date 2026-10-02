import { Router } from 'express';
import { ComplaintController } from '../controllers/complaint.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Citizen creates complaint (accepts images & audio files)
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'audio', maxCount: 1 }
  ]),
  ComplaintController.create
);

// List complaints (scoped by role inside controller)
router.get('/', authenticate, ComplaintController.list);

// Single complaint details
router.get('/:id', authenticate, ComplaintController.getById);

// Timeline and status transitions
router.get('/:id/timeline', authenticate, ComplaintController.getTimeline);

// Panchayat Officer verifies or rejects complaint
router.post(
  '/:id/verify',
  authenticate,
  authorize(UserRole.PANCHAYAT_OFFICER, UserRole.ADMIN),
  ComplaintController.verify
);

// Panchayat Officer assigns worker
router.post(
  '/:id/assign',
  authenticate,
  authorize(UserRole.PANCHAYAT_OFFICER, UserRole.ADMIN),
  ComplaintController.assignWorker
);

// Citizen verifies resolution (Mandatory: Yes -> CLOSED, No -> REOPENED)
router.post(
  '/:id/verify-resolution',
  authenticate,
  authorize(UserRole.CITIZEN),
  ComplaintController.verifyResolution
);

// Citizen submits feedback & rating
router.post(
  '/:id/feedback',
  authenticate,
  authorize(UserRole.CITIZEN),
  ComplaintController.submitFeedback
);

export default router;
