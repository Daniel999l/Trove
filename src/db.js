import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}