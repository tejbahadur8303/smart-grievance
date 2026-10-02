import { ISttProvider, SttTranscribeResult } from './stt.provider.interface';
import path from 'path';

export class DevFallbackSttProvider implements ISttProvider {
  async transcribe(audioFilePath: string, language: string = 'hi-IN'): Promise<SttTranscribeResult> {
    const filename = path.basename(audioFilePath).toLowerCase();
    
    // Provide realistic Hindi/English sample transcripts for testing voice flows in dev mode
    let simulatedTranscript = 'Hamare gaon me main sadak par bijli ka taar toota hua pada hai aur current ka khatra hai. Kripya turant theek karwayein.';

    if (filename.includes('water') || filename.includes('pani')) {
      simulatedTranscript = 'Gaon ki mukhya pipeline pichle do din se phoot gayi hai aur peene ke paani ki samasya ho rahi hai.';
    } else if (filename.includes('road') || filename.includes('sadak')) {
      simulatedTranscript = 'School ke samne wali sadak par bada gaddha hai jisse aate jate log gir rahe hain.';
    } else if (filename.includes('ration') || filename.includes('rashan')) {
      simulatedTranscript = 'Kotedar is mahine ka ration kam de raha hai aur dukan samay par nahi khol raha.';
    }

    return {
      transcript: `[DEV PREVIEW - Edit Before Submitting]: ${simulatedTranscript}`,
      language,
      confidence: 0.85,
      provider: 'DevFallbackSttProvider (Development Mode)'
    };
  }
}
