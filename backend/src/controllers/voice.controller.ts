import { Request, Response } from 'express';
import { getSttProvider } from '../providers/stt';
import { getStorageProvider } from '../providers/storage';

export class VoiceController {
  static async transcribe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No audio file provided',
          code: 'MISSING_AUDIO_FILE'
        });
        return;
      }

      const language = (req.body.language as string) || 'hi-IN';
      const sttProvider = getSttProvider();
      const storage = getStorageProvider();

      // Transcribe the uploaded audio file
      const result = await sttProvider.transcribe(req.file.path, language);
      const fileUrl = storage.getFileUrl(req.file.filename);

      res.status(200).json({
        success: true,
        message: 'Audio transcribed successfully',
        data: {
          transcript: result.transcript,
          language: result.language,
          confidence: result.confidence,
          provider: result.provider,
          audioUrl: fileUrl,
          filename: req.file.filename
        }
      });
    } catch (error: any) {
      console.error('[VoiceController Error]:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Speech-to-text transcription failed',
        code: 'STT_FAILED'
      });
    }
  }
}
