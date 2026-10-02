import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { ISttProvider, SttTranscribeResult } from './stt.provider.interface';
import { env } from '../../config/env';

export class GeminiSttProvider implements ISttProvider {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  async transcribe(audioFilePath: string, language: string = 'hi-IN'): Promise<SttTranscribeResult> {
    if (!this.client || !env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured for Gemini STT provider');
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    const audioBytes = fs.readFileSync(audioFilePath);
    const base64Audio = audioBytes.toString('base64');
    const ext = path.extname(audioFilePath).toLowerCase().replace('.', '');
    const mimeType = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : ext === 'm4a' ? 'audio/m4a' : 'audio/webm';

    const response = await this.client.models.generateContent({
      model: 'gemini-3.5-transcribe', // or gemini-3.8-flash
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio
              }
            },
            {
              text: `Transcribe this rural village grievance audio recording accurately in the native spoken language (${language} / Hindi / Hinglish / English). Return ONLY the clean verbatim transcript text, without any introductory or concluding comments.`
            }
          ]
        }
      ]
    });

    const transcript = response.text?.trim() || '';

    return {
      transcript,
      language,
      confidence: 0.94,
      provider: 'Google Gemini Audio'
    };
  }
}
