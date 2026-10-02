import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/analyze-complaint', optionalAuthenticate, AiController.analyzeComplaint);
router.post('/chat', optionalAuthenticate, AiController.chat);

export default router;
