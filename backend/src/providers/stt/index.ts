import { ISttProvider } from './stt.provider.interface';
import { GeminiSttProvider } from './gemini.stt';
import { DevFallbackSttProvider } from './dev.stt';
import { env } from '../../config/env';

let sttInstance: ISttProvider;

export function getSttProvider(): ISttProvider {
  if (!sttInstance) {
    if (env.STT_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
      sttInstance = new GeminiSttProvider();
    } else {
      sttInstance = new DevFallbackSttProvider();
    }
  }
  return sttInstance;
}

export * from './stt.provider.interface';
