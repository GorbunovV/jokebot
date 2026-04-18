import Anthropic from '@anthropic-ai/sdk';
import type { ClaudeConfig, Joke, TranslatedJoke } from './types.js';

function buildSystemPrompt(targetLang: string, context: string): string {
  const lines = [
    `You translate jokes from English to ${targetLang}.`,
    'Preserve humor, punchline timing, wordplay, and register.',
    'Return ONLY the translation — no commentary, no quotes, no explanations.',
  ];
  if (context) lines.push(`Context: ${context}`);
  return lines.join('\n');
}

function firstText(content: Anthropic.ContentBlock[]): string {
  for (const block of content) {
    if (block.type === 'text') return block.text;
  }
  throw new Error('Claude returned no text block');
}

function parseJson(raw: string): unknown {
  let t = raw.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }
  return JSON.parse(t);
}

export async function translateWithClaude(
  joke: Joke,
  { apiKey, model, context, targetLang }: ClaudeConfig,
): Promise<TranslatedJoke> {
  const client = new Anthropic({ apiKey });
  const baseSystem = buildSystemPrompt(targetLang, context);

  if (joke.type === 'single') {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: baseSystem,
      messages: [{ role: 'user', content: joke.joke }],
    });
    return { type: 'single', joke: firstText(response.content).trim() };
  }

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system:
      `${baseSystem}\n\n` +
      'Output a JSON object with exactly two string keys, "setup" and "delivery". No markdown, no extra text.',
    messages: [
      {
        role: 'user',
        content:
          'Translate this two-part joke as a pair so the punchline lands in the target language.\n\n' +
          `Setup: ${joke.setup}\nDelivery: ${joke.delivery}`,
      },
    ],
  });

  const parsed = parseJson(firstText(response.content));
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as Record<string, unknown>).setup !== 'string' ||
    typeof (parsed as Record<string, unknown>).delivery !== 'string'
  ) {
    throw new Error('Claude returned malformed JSON for twopart joke');
  }
  const p = parsed as { setup: string; delivery: string };
  return { type: 'twopart', setup: p.setup.trim(), delivery: p.delivery.trim() };
}
