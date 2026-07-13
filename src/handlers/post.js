import Item from '../models/Item.js';

const postState = new Map();

export async function postCommand(ctx) {
  postState.set(ctx.from.id, { step: 'title' });
  await ctx.reply("What's the item called? (e.g., 'JAMB Physics Textbook')");
}

export async function handlePostMessage(ctx) {
  const state = postState.get(ctx.from.id);
  if (!state) return;

  const text = ctx.message.text;

  switch (state.step) {
    case 'title':
      state.title = text;
      state.step = 'description';
      await ctx.reply('Describe it (or type "skip"):');
      break;
    case 'description':
      state.description = text === 'skip' ? '' : text;
      state.step = 'category';
      await ctx.reply('Category?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📖 Textbook', callback_data: 'cat_textbook' }],
            [{ text: '✏️ Supplies', callback_data: 'cat_supplies' }],
            [{ text: '🔧 Tools', callback_data: 'cat_tools' }],
            [{ text: 'Other', callback_data: 'cat_other' }],
          ]
        }
      });
      break;
    default:
      break;
  }
}

export async function handleCategoryCallback(ctx) {
  if (!ctx.callbackQuery) return;
  const data = ctx.callbackQuery.data;
  if (!data.startsWith('cat_')) return;

  const category = data.replace('cat_', '');
  const state = postState.get(ctx.from.id);
  if (!state) return;

  state.category = category;
  state.step = 'location';
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  await ctx.reply('📍 What area are you in? (or type "skip" to use your saved location)');
}

export async function handlePostLocation(ctx) {
  const state = postState.get(ctx.from.id);
  if (!state || state.step !== 'location') return;

  let location = ctx.message.text.trim();
  if (location.toLowerCase() === 'skip') {
    const user = await (await import('../models/User.js')).default.findOne({ telegramId: ctx.from.id });
    location = user?.location || '';
    if (!location) {
      return ctx.reply('You have no saved location. Use /setlocation first, or type your area.');
    }
  }

  const item = await Item.create({
    postedBy: ctx.from.id,
    title: state.title,
    description: state.description,
    category: state.category,
    location,
  });

  postState.delete(ctx.from.id);
  await ctx.reply(`✅ Posted! "${item.title}" in ${location} is now available.\n\nItem ID: ${item._id}`);
}