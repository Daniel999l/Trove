import express from 'express';
import { config } from './config.js';
import { connectDB } from './db.js';
import { bot } from './services/telegram.js';
import ensureUser from './middleware/auth.js';
import { startCommand, setLocationCommand } from './handlers/start.js';
import { postCommand, handlePostMessage, handleCategoryCallback, handlePostLocation } from './handlers/post.js';
import { requestCommand, handleClaimCallback } from './handlers/request.js';
import { profileCommand } from './handlers/profile.js';
import { feedbackCommand, confirmCommand } from './handlers/feedback.js';

const app = express();

app.use(express.json());

app.get('/', (_, res) => res.send('Trove is alive'));

app.use(bot.webhookCallback('/telegraf'));

bot.use(ensureUser);

bot.start(startCommand);
bot.command('setlocation', setLocationCommand);
bot.command('post', postCommand);
bot.command('request', requestCommand);
bot.command('profile', profileCommand);
bot.command('feedback', feedbackCommand);
bot.command('confirm', confirmCommand);

bot.action(/^cat_/, handleCategoryCallback);
bot.action(/^claim_/, handleClaimCallback);

bot.hears(/.*/, async (ctx, next) => {
  if (ctx.message?.text?.startsWith('/')) return next();
  await handlePostMessage(ctx);
  await next();
});

async function start() {
  await connectDB();
  if (config.webhookUrl) {
    await bot.telegram.setWebhook(`${config.webhookUrl}`);
    app.listen(config.port, () => console.log(`Trove webhook running on ${config.port}`));
  } else {
    await bot.launch();
    console.log('Trove polling mode');
  }
}

start().catch(console.error);