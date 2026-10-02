import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Field Worker task actions
router.get('/', authenticate, authorize(UserRole.FIELD_WORKER, UserRole.ADMIN), TaskController.list);
router.post('/:id/accept', authenticate, authorize(UserRole.FIELD_WORKER), TaskController.accept);
router.post('/:id/reject', authenticate, authorize(UserRole.FIELD_WORKER), TaskController.reject);

// Worker starts work and uploads before photos
router.post(
  '/:id/start',
  authenticate,
  authorize(UserRole.FIELD_WORKER),
  upload.array('beforePhotos', 4),
  TaskController.startWork
);

// Worker completes task and uploads after photos + notes + GPS
router.post(
  '/:id/complete',
  authenticate,
  authorize(UserRole.FIELD_WORKER),
  upload.array('afterPhotos', 4),
  TaskController.completeTask
);

export default router;
