import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  postedBy: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['textbook', 'supplies', 'tools', 'other'], default: 'other' },
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'claimed', 'completed'], default: 'available' },
  claimedBy: { type: Number, default: null },
  completedAt: Date,
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);