import mongoose from 'mongoose';

const PracticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  score: { type: Number, default: null }, // optional score
  createdAt: { type: Date, default: Date.now },
  tags: [{ type: String }]
});

export default mongoose.model('Practice', PracticeSchema);
