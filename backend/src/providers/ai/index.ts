import { IAiProvider } from './ai.provider.interface';
import { GeminiAiProvider } from './gemini.provider';
import { DeterministicRulesAiProvider } from './rules.provider';
import { env } from '../../config/env';

let aiInstance: IAiProvider;

export function getAiProvider(): IAiProvider {
  if (!aiInstance) {
    if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
      aiInstance = new GeminiAiProvider();
    } else {
      aiInstance = new DeterministicRulesAiProvider();
    }
  }
  return aiInstance;
}

export * from './ai.provider.interface';
