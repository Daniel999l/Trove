import User from '../models/User.js';
import Item from '../models/Item.js';

export async function profileCommand(ctx) {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) return ctx.reply('Please /start first.');

  const postedItems = await Item.find({ postedBy: ctx.from.id });
  const claimedItems = await Item.find({ claimedBy: ctx.from.id });

  const availableCount = postedItems.filter(i => i.status === 'available').length;
  const completedCount = postedItems.filter(i => i.status === 'completed').length;

  await ctx.reply(
    `👤 *Your Profile*\n\n` +
    `📍 Location: ${user.location || 'Not set'}\n` +
    `⭐ Reputation: ${user.reputation}\n\n` +
    `📦 Items posted: ${postedItems.length} (${availableCount} available, ${completedCount} completed)\n` +
    `🤝 Items claimed: ${claimedItems.length}\n\n` +
    `Use /setlocation <area> to update your location.`,
    { parse_mode: 'Markdown' }
  );
}