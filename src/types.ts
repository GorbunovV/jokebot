import type { TargetLanguageCode } from 'deepl-node';

export type JokeFlags = {
  nsfw: boolean;
  religious: boolean;
  political: boolean;
  racist: boolean;
  sexist: boolean;
  explicit: boolean;
};

type JokeBase = {
  category: string;
  flags: JokeFlags;
  id: number;
  lang: string;
  safe: boolean;
};

export type JokeSingle = JokeBase & { type: 'single'; joke: string };
export type JokeTwoPart = JokeBase & { type: 'twopart'; setup: string; delivery: string };
export type Joke = JokeSingle | JokeTwoPart;

export type JokeApiErrorResponse = {
  error: true;
  internalError: boolean;
  code: number;
  message: string;
  causedBy: string[];
  additionalInfo: string;
  timestamp: number;
};

export type JokeApiSuccessResponse = Joke & { error: false };
export type JokeApiResponse = JokeApiErrorResponse | JokeApiSuccessResponse;

export type TranslatedSingle = { type: 'single'; joke: string };
export type TranslatedTwoPart = { type: 'twopart'; setup: string; delivery: string };
export type TranslatedJoke = TranslatedSingle | TranslatedTwoPart;

export type TelegramConfig = {
  botToken: string;
  groupChatId: string;
  adminChatId: string;
};

export type TranslationProvider = 'deepl' | 'claude';

export type DeeplConfig = {
  apiKey: string;
  context: string;
  targetLang: TargetLanguageCode;
};

export type ClaudeConfig = {
  apiKey: string;
  model: string;
  context: string;
  targetLang: string;
};

export type TranslationConfig =
  | { provider: 'deepl'; config: DeeplConfig }
  | { provider: 'claude'; config: ClaudeConfig };

export type JokeFetchConfig = {
  category: string;
  maxApiRetries: number;
  maxDuplicateRetries: number;
};

export type AppConfig = {
  telegram: TelegramConfig;
  translation: TranslationConfig;
  joke: JokeFetchConfig;
  storagePath: string;
};

export type FetchUniqueJokeOptions = JokeFetchConfig & {
  sentIds: Set<number>;
};

export type SentIdsFile = {
  ids: number[];
};

export type TelegramClient = {
  sendToGroup: (chatId: string, text: string) => Promise<unknown>;
  sendToAdmin: (chatId: string, text: string) => Promise<unknown>;
};
