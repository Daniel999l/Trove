import Review from '../models/Review.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

export async function feedbackCommand(ctx) {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) {
    return ctx.reply('Usage: /feedback <itemId> <rating 1-5>');
  }

  const itemId = parts[1];
  const rating = parseInt(parts[2]);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return ctx.reply('Rating must be between 1 and 5.');
  }

  const item = await Item.findById(itemId);
  if (!item || item.status !== 'completed') {
    return ctx.reply('Item not found or exchange not yet completed.');
  }

  const isGiver = item.postedBy === ctx.from.id;
  const isReceiver = item.claimedBy === ctx.from.id;
  if (!isGiver && !isReceiver) {
    return ctx.reply('You were not part of this exchange.');
  }

  const receiverId = isGiver ? item.claimedBy : item.postedBy;

  const existing = await Review.findOne({ giverId: ctx.from.id, itemId });
  if (existing) {
    return ctx.reply('You already left feedback for this item.');
  }

  await Review.create({
    giverId: ctx.from.id,
    receiverId,
    itemId,
    rating,
  });

  await User.findOneAndUpdate({ telegramId: receiverId }, { $inc: { reputation: rating } });

  await ctx.reply(`✅ Feedback submitted! ${rating}/5 — reputation updated.`);
}

export async function confirmCommand(ctx) {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) {
    return ctx.reply('Usage: /confirm <itemId>');
  }

  const Item = (await import('../models/Item.js')).default;
  const item = await Item.findById(parts[1]);
  if (!item) return ctx.reply('Item not found.');
  if (item.postedBy !== ctx.from.id) return ctx.reply('Only the poster can confirm completion.');
  if (item.status !== 'claimed') return ctx.reply('Item is not in claimed state.');

  item.status = 'completed';
  item.completedAt = new Date();
  await item.save();

  await ctx.reply(`✅ "${item.title}" marked as completed! Both parties can now leave feedback using /feedback ${item._id} <rating 1-5>.`);
}