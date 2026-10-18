import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  },
  {
    timestamps: true,
  }
);

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);

export default Admin;
