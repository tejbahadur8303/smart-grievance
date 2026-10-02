import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/workers', authenticate, authorize(UserRole.ADMIN, UserRole.PANCHAYAT_OFFICER), AuthController.listWorkers);

export default router;
