import { findMatches } from '../services/matcher.js';
import User from '../models/User.js';

export async function requestCommand(ctx) {
  const text = ctx.message.text.replace('/request', '').trim();
  if (!text) {
    return ctx.reply('Usage: /request JAMB physics textbook Surulere');
  }

  const user = await User.findOne({ telegramId: ctx.from.id });
  const location = user?.location || '';

  const matches = await findMatches(text, location);

  if (matches.length === 0) {
    return ctx.reply('No matches found. Try different keywords or check back later.');
  }

  const lines = matches.map((m, i) =>
    `${i + 1}. ${m.title} — ${m.location} (by ${m.postedBy})`
  );

  const keyboard = matches.map(m => [
    { text: `Claim: ${m.title}`, callback_data: `claim_${m._id}` }
  ]);

  await ctx.reply(`Found ${matches.length} item(s):\n\n` + lines.join('\n'), {
    reply_markup: { inline_keyboard: keyboard }
  });
}

export async function handleClaimCallback(ctx) {
  if (!ctx.callbackQuery || !ctx.callbackQuery.data.startsWith('claim_')) return;

  const itemId = ctx.callbackQuery.data.replace('claim_', '');
  const Item = (await import('../models/Item.js')).default;

  const item = await Item.findById(itemId);
  if (!item || item.status !== 'available') {
    return ctx.editMessageText('❌ Sorry, that item is no longer available.');
  }

  item.status = 'claimed';
  item.claimedBy = ctx.from.id;
  await item.save();

  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  await ctx.reply(
    `✅ You've claimed "${item.title}".\n\n` +
    `The poster (ID: ${item.postedBy}) has been notified. ` +
    `When you've received the item, the poster can use /confirm ${item._id} to complete the exchange.`
  );

  try {
    await ctx.telegram.sendMessage(
      item.postedBy,
      `🔔 Someone claimed your item "${item.title}". ` +
      `Their Telegram ID: ${ctx.from.id}. ` +
      `Use /confirm ${item._id} once you've handed it over.`
    );
  } catch (e) {
    // poster may not have started the bot; ignore
  }
}