import type { FetchUniqueJokeOptions, Joke, JokeApiResponse } from './types.js';

const JOKE_API_BASE = 'https://v2.jokeapi.dev/joke';

export class JokeApiError extends Error {
  override readonly name = 'JokeApiError';
}

export class AllDuplicatesError extends Error {
  override readonly name = 'AllDuplicatesError';
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function requestJoke(category: string, maxApiRetries: number): Promise<Joke> {
  const url = `${JOKE_API_BASE}/${encodeURIComponent(category)}?lang=en&format=json&blacklistFlags=nsfw,sexist`;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxApiRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const body = (await res.json()) as JokeApiResponse;
      if (body.error) {
        const reason = Array.isArray(body.causedBy) ? body.causedBy.join('; ') : body.message;
        throw new Error(`JokeAPI returned error: ${reason}`);
      }
      const { error: _discard, ...joke } = body;
      return joke as Joke;
    } catch (err) {
      lastErr = err;
      if (attempt < maxApiRetries) {
        await sleep(1000 * 2 ** (attempt - 1));
      }
    }
  }

  const message = lastErr instanceof Error ? lastErr.message : String(lastErr ?? 'unknown error');
  throw new JokeApiError(`JokeAPI failed after ${maxApiRetries} attempts: ${message}`);
}

export async function fetchUniqueJoke(options: FetchUniqueJokeOptions): Promise<Joke> {
  const { category, maxApiRetries, maxDuplicateRetries, sentIds } = options;

  for (let attempt = 1; attempt <= maxDuplicateRetries; attempt++) {
    const joke = await requestJoke(category, maxApiRetries);
    if (!sentIds.has(joke.id)) {
      return joke;
    }
  }

  throw new AllDuplicatesError(
    `Got only duplicate jokes after ${maxDuplicateRetries} attempts (${sentIds.size} already stored)`,
  );
}
