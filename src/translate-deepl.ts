import * as deepl from 'deepl-node';
import type { DeeplConfig, Joke, TranslatedJoke } from './types.js';

export async function translateWithDeepl(
  joke: Joke,
  { apiKey, targetLang, context }: DeeplConfig,
): Promise<TranslatedJoke> {
  const client = new deepl.DeepLClient(apiKey);
  const options: deepl.TranslateTextOptions = context ? { context } : {};

  if (joke.type === 'single') {
    const result = await client.translateText(joke.joke, 'en', targetLang, options);
    return { type: 'single', joke: result.text };
  }

  const results = await client.translateText(
    [joke.setup, joke.delivery],
    'en',
    targetLang,
    options,
  );
  return { type: 'twopart', setup: results[0].text, delivery: results[1].text };
}
