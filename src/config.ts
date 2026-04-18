import 'dotenv/config';
import type { TargetLanguageCode } from 'deepl-node';
import type { AppConfig, TranslationConfig } from './types.js';

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v.trim();
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Env var ${name} must be a positive integer, got: ${raw}`);
  }
  return n;
}

function buildTranslation(): TranslationConfig {
  const provider = optional('TRANSLATION_PROVIDER', 'deepl').toLowerCase();
  if (provider === 'deepl') {
    return {
      provider: 'deepl',
      config: {
        apiKey: required('DEEPL_API_KEY'),
        context: optional('DEEPL_CONTEXT', ''),
        targetLang: optional('DEEPL_TARGET_LANG', 'RU') as TargetLanguageCode,
      },
    };
  }
  if (provider === 'claude') {
    return {
      provider: 'claude',
      config: {
        apiKey: required('ANTHROPIC_API_KEY'),
        model: optional('CLAUDE_MODEL', 'claude-sonnet-4-6'),
        context: optional('CLAUDE_CONTEXT', ''),
        targetLang: optional('CLAUDE_TARGET_LANG', 'Russian'),
      },
    };
  }
  throw new Error(`Unknown TRANSLATION_PROVIDER "${provider}". Use "deepl" or "claude".`);
}

export const config: AppConfig = {
  telegram: {
    botToken: required('TELEGRAM_BOT_TOKEN'),
    groupChatId: required('TELEGRAM_GROUP_CHAT_ID'),
    adminChatId: required('TELEGRAM_ADMIN_CHAT_ID'),
  },
  translation: buildTranslation(),
  joke: {
    category: optional('JOKE_API_CATEGORY', 'Dark'),
    maxApiRetries: intEnv('MAX_API_RETRIES', 3),
    maxDuplicateRetries: intEnv('MAX_DUPLICATE_RETRIES', 10),
  },
  storagePath: optional('STORAGE_PATH', './storage/sent-jokes.json'),
};
