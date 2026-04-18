import { Telegraf } from 'telegraf';
import type { TelegramClient } from './types.js';

export function createTelegram(botToken: string): TelegramClient {
  const bot = new Telegraf(botToken);
  return {
    sendToGroup: (chatId, text) =>
      bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' }),
    sendToAdmin: (chatId, text) => bot.telegram.sendMessage(chatId, text),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatGroupMessage(russianText: string): string {
  return `#joke\n\n${escapeHtml(russianText)}`;
}
