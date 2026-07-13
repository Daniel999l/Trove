import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN,
  mongoUri: process.env.MONGODB_URI,
  groqApiKey: process.env.GROQ_API_KEY || null,
  port: process.env.PORT || 3000,
  webhookUrl: process.env.WEBHOOK_URL,
};