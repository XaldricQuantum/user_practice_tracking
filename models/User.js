// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
//   practices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practice' }]
// });

// export default mongoose.model('User', UserSchema);

import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true }
});

export default mongoose.model('User', UserSchema);
