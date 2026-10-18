import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  story?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  sku: string;
  stock: number;
  reservedStock: number;
  availability: 'in_stock' | 'reserved' | 'sold_out' | 'made_to_order';
  featured: boolean;
  isNewArrival?: boolean;
  status: 'active' | 'draft' | 'archived';
  specifications: {
    movement?: string;
    caseMaterial?: string;
    strapMaterial?: string;
    dialColor?: string;
    waterResistance?: string;
    caseDiameter?: string;
    crystal?: string;
    powerReserve?: string;
    warranty?: string;
    referenceNumber?: string;
    condition?: string;
  };
  images: Array<{
    url: string;
    publicId?: string;
    alt?: string;
    width?: number;
    height?: number;
    isPrimary?: boolean;
  }>;
  video?: {
    url: string;
    publicId?: string;
    thumbnailUrl?: string;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    brand: { type: String, required: true, index: true, trim: true },
    category: { type: String, required: true, index: true, trim: true },
    description: { type: String, required: true },
    story: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    stock: { type: Number, default: 1, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    availability: {
      type: String,
      enum: ['in_stock', 'reserved', 'sold_out', 'made_to_order'],
      default: 'in_stock',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true,
    },
    specifications: {
      movement: { type: String, default: '' },
      caseMaterial: { type: String, default: '' },
      strapMaterial: { type: String, default: '' },
      dialColor: { type: String, default: '' },
      waterResistance: { type: String, default: '' },
      caseDiameter: { type: String, default: '' },
      crystal: { type: String, default: '' },
      powerReserve: { type: String, default: '' },
      warranty: { type: String, default: '' },
      referenceNumber: { type: String, default: '' },
      condition: { type: String, default: '' },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String, default: '' },
        width: { type: Number },
        height: { type: Number },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    video: {
      url: { type: String },
      publicId: { type: String },
      thumbnailUrl: { type: String },
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal catalogue filtering
ProductSchema.index({ status: 1, category: 1, price: 1 });
ProductSchema.index({ status: 1, brand: 1, price: 1 });
ProductSchema.index({ status: 1, featured: 1, createdAt: -1 });

export const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

export default Product;
