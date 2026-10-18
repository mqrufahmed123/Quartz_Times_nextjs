import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

export default mongoose.models.RequestBudget || mongoose.model('RequestBudget', schema);
