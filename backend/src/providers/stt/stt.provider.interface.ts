export interface SttTranscribeResult {
  transcript: string;
  language: string;
  confidence: number;
  provider: string;
  audioDurationSeconds?: number;
}

export interface ISttProvider {
  transcribe(audioFilePath: string, language?: string): Promise<SttTranscribeResult>;
}
