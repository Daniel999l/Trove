import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  giverId: { type: Number, required: true },
  receiverId: { type: Number, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);