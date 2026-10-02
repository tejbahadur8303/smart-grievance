import { Router } from 'express';
import { RationController } from '../controllers/ration.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

// Fair price shops & allocations
router.get('/shops', authenticate, RationController.listShops);
router.get('/shops/:shopId/allocations', authenticate, RationController.getShopAllocations);

// Citizen distribution records & monthly entitlement
router.get('/my-distributions', authenticate, authorize(UserRole.CITIZEN), RationController.myDistributions);

// Citizen reports ration irregularity (short quantity, closed shop, overcharging)
router.post('/report-grievance', authenticate, authorize(UserRole.CITIZEN), RationController.reportGrievance);

// Officer/Admin lists ration grievances
router.get('/grievances', authenticate, authorize(UserRole.PANCHAYAT_OFFICER, UserRole.ADMIN), RationController.listGrievances);

export default router;
