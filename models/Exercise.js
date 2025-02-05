import mongoose from 'mongoose';

const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Exercise', ExerciseSchema);
