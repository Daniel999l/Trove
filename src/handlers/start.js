import User from '../models/User.js';

export async function startCommand(ctx) {
  const { id, username, first_name, last_name } = ctx.from;
  await User.findOneAndUpdate(
    { telegramId: id },
    { $setOnInsert: { telegramId: id, username, firstName: first_name, lastName: last_name } },
    { upsert: true }
  );

  await ctx.reply(
    `Welcome to Trove, ${first_name}!\n\n` +
    `Share what you have, get what you need.\n\n` +
    `Use /setlocation <your area> to tell people where you are.\n` +
    `/post — share an item\n` +
    `/request <what you need> — find items\n` +
    `/profile — your items and reputation`
  );
}

export async function setLocationCommand(ctx) {
  const loc = ctx.message.text.replace('/setlocation', '').trim();
  if (!loc) {
    return ctx.reply('Usage: /setlocation Surulere');
  }
  await User.findOneAndUpdate({ telegramId: ctx.from.id }, { location: loc });
  ctx.reply(`Location set to ${loc}.`);
}