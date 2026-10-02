import { Router } from 'express';
import { VillageController } from '../controllers/village.controller';

const router = Router();

router.get('/districts', VillageController.listDistricts);
router.get('/blocks', VillageController.listBlocks);
router.get('/panchayats', VillageController.listPanchayats);
router.get('/villages', VillageController.listVillages);
router.get('/departments', VillageController.listDepartments);
router.get('/nearby-services', VillageController.getNearbyServices);

export default router;
