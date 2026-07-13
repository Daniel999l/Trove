import { config } from '../config.js';
import { Telegraf } from 'telegraf';

export const bot = new Telegraf(config.botToken);

export function sendMessage(chatId, text, extra = {}) {
  return bot.telegram.sendMessage(chatId, text, extra);
}