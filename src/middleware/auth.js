import User from '../models/User.js';

export default function ensureUser(ctx, next) {
  if (ctx.message?.from) {
    const { id, username, first_name, last_name } = ctx.message.from;
    User.findOneAndUpdate(
      { telegramId: id },
      { $setOnInsert: { telegramId: id, username, firstName: first_name, lastName: last_name } },
      { upsert: true, new: true }
    ).catch(err => console.error('Auth middleware error:', err.message));
  }
  return next();
}