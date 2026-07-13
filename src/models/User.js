import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, unique: true, required: true },
  username: String,
  firstName: String,
  lastName: String,
  location: { type: String, default: '' },
  reputation: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);