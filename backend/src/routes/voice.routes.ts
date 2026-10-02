import { Router } from 'express';
import { VoiceController } from '../controllers/voice.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Audio upload and Speech-to-Text transcription
router.post('/transcribe', upload.single('audio'), VoiceController.transcribe);

export default router;
