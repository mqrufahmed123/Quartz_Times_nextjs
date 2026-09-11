import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSettingsDocument extends Document {
  key: string;
  badgeText: string;
  titleLine1: string;
  titleHighlight: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  featuredWatchTitle: string;
  featuredWatchRef: string;
  featuredWatchLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSettingsSchema = new Schema<IHeroSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'default_hero' },
    badgeText: { type: String, default: 'Authentic Watch Boutique' },
    titleLine1: { type: String, default: 'TIMECRAFTED' },
    titleHighlight: { type: String, default: 'PRECISION' },
    subtitle: {
      type: String,
      default:
        'Discover our handpicked collection of luxury and premium watches. 100% authentic Swiss and Japanese models with fast insured delivery across India.',
    },
    heroImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop',
    },
    heroImageAlt: { type: String, default: 'Featured Luxury Watch' },
    featuredWatchTitle: { type: String, default: 'Royal Oak Selfwinding' },
    featuredWatchRef: { type: String, default: 'Ref. 15202ST' },
    featuredWatchLink: {
      type: String,
      default: '/watches/royal-oak-selfwinding-jumbo-ultra-thin',
    },
  },
  {
    timestamps: true,
  }
);

export const HeroSettings: Model<IHeroSettingsDocument> =
  mongoose.models.HeroSettings ||
  mongoose.model<IHeroSettingsDocument>('HeroSettings', HeroSettingsSchema);

export default HeroSettings;
