import type { Joke, TranslatedJoke, TranslationConfig } from './types.js';
import { translateWithDeepl } from './translate-deepl.js';
import { translateWithClaude } from './translate-claude.js';

export async function translateJoke(
  joke: Joke,
  translation: TranslationConfig,
): Promise<TranslatedJoke> {
  if (translation.provider === 'deepl') {
    return translateWithDeepl(joke, translation.config);
  }
  return translateWithClaude(joke, translation.config);
}

export function formatTranslatedText(translated: TranslatedJoke): string {
  if (translated.type === 'single') return translated.joke;
  return `${translated.setup}\n\n${translated.delivery}`;
}
