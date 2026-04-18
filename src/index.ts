import { config } from './config.js';
import { fetchUniqueJoke } from './joke.js';
import { loadSentIds, saveSentId } from './storage.js';
import { formatTranslatedText, translateJoke } from './translate.js';
import { createTelegram, formatGroupMessage } from './telegram.js';

async function main(): Promise<void> {
  const telegram = createTelegram(config.telegram.botToken);

  try {
    const sentIds = loadSentIds(config.storagePath);

    const joke = await fetchUniqueJoke({
      category: config.joke.category,
      maxApiRetries: config.joke.maxApiRetries,
      maxDuplicateRetries: config.joke.maxDuplicateRetries,
      sentIds,
    });

    const translated = await translateJoke(joke, config.translation);

    const message = formatGroupMessage(formatTranslatedText(translated));

    await telegram.sendToGroup(config.telegram.groupChatId, message);
    saveSentId(config.storagePath, joke.id);

    console.log(`[joke-bot] sent joke id=${joke.id} category=${joke.category}`);
  } catch (err) {
    const name = err instanceof Error ? err.name : 'Error';
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[joke-bot] ${name}: ${message}`);
    try {
      await telegram.sendToAdmin(config.telegram.adminChatId, `[joke-bot] ${name}: ${message}`);
    } catch (adminErr) {
      const adminMsg = adminErr instanceof Error ? adminErr.message : String(adminErr);
      console.error(`[joke-bot] failed to notify admin: ${adminMsg}`);
    }
    process.exit(1);
  }
}

main();
