import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInquiryDocument extends Document {
  name: string;
  phone: string;
  email?: string;
  product?: string;
  productId?: string;
  productSku?: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiryDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    product: { type: String, default: '' },
    productId: { type: String, default: '' },
    productSku: { type: String, default: '' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

InquirySchema.index({ createdAt: -1 });

export const Inquiry: Model<IInquiryDocument> =
  mongoose.models.Inquiry || mongoose.model<IInquiryDocument>('Inquiry', InquirySchema);

export default Inquiry;
