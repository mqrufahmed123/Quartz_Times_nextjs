import connectToDatabase from '@/lib/mongodb';
import HeroSettings from '@/models/HeroSettings';
import { IHeroSettings } from '@/types';

export const DEFAULT_HERO_SETTINGS: IHeroSettings = {
  badgeText: 'Authentic Watch Boutique',
  titleLine1: 'TIMECRAFTED',
  titleHighlight: 'PRECISION',
  subtitle:
    'Discover our handpicked collection of luxury and premium watches. 100% authentic Swiss and Japanese models with fast insured delivery across India.',
  heroImage:
    'https://images.unsplash.com/photo-1547996160-71dfabbce5fa?q=80&w=1200&auto=format&fit=crop',
  heroImageAlt: 'Featured Luxury Watch',
  featuredWatchTitle: 'Royal Oak Selfwinding',
  featuredWatchRef: 'Ref. 15202ST',
  featuredWatchLink: '/watches/royal-oak-selfwinding-jumbo-ultra-thin',
};

let inMemoryHeroSettings: IHeroSettings = { ...DEFAULT_HERO_SETTINGS };

function documentToHeroSettings(doc: any): IHeroSettings {
  if (!doc) return { ...DEFAULT_HERO_SETTINGS };
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    badgeText: obj.badgeText || DEFAULT_HERO_SETTINGS.badgeText,
    titleLine1: obj.titleLine1 || DEFAULT_HERO_SETTINGS.titleLine1,
    titleHighlight: obj.titleHighlight || DEFAULT_HERO_SETTINGS.titleHighlight,
    subtitle: obj.subtitle || DEFAULT_HERO_SETTINGS.subtitle,
    heroImage: obj.heroImage || DEFAULT_HERO_SETTINGS.heroImage,
    heroImageAlt: obj.heroImageAlt || DEFAULT_HERO_SETTINGS.heroImageAlt,
    featuredWatchTitle: obj.featuredWatchTitle || DEFAULT_HERO_SETTINGS.featuredWatchTitle,
    featuredWatchRef: obj.featuredWatchRef || DEFAULT_HERO_SETTINGS.featuredWatchRef,
    featuredWatchLink: obj.featuredWatchLink || DEFAULT_HERO_SETTINGS.featuredWatchLink,
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
}

export async function getHeroSettings(): Promise<IHeroSettings> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await HeroSettings.findOne({ key: 'default_hero' }).lean();
      if (doc) {
        const parsed = documentToHeroSettings(doc);
        inMemoryHeroSettings = { ...parsed };
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error fetching hero settings from DB, falling back:', err);
  }

  return { ...inMemoryHeroSettings };
}

export async function updateHeroSettings(
  data: Partial<IHeroSettings>
): Promise<IHeroSettings> {
  const payload = {
    badgeText: data.badgeText ?? inMemoryHeroSettings.badgeText,
    titleLine1: data.titleLine1 ?? inMemoryHeroSettings.titleLine1,
    titleHighlight: data.titleHighlight ?? inMemoryHeroSettings.titleHighlight,
    subtitle: data.subtitle ?? inMemoryHeroSettings.subtitle,
    heroImage: data.heroImage ?? inMemoryHeroSettings.heroImage,
    heroImageAlt: data.heroImageAlt ?? inMemoryHeroSettings.heroImageAlt,
    featuredWatchTitle: data.featuredWatchTitle ?? inMemoryHeroSettings.featuredWatchTitle,
    featuredWatchRef: data.featuredWatchRef ?? inMemoryHeroSettings.featuredWatchRef,
    featuredWatchLink: data.featuredWatchLink ?? inMemoryHeroSettings.featuredWatchLink,
  };

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await HeroSettings.findOneAndUpdate(
        { key: 'default_hero' },
        { ...payload, key: 'default_hero' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (doc) {
        const saved = documentToHeroSettings(doc);
        inMemoryHeroSettings = { ...saved };
        return saved;
      }
    }
  } catch (err) {
    console.error('Error saving hero settings to DB:', err);
    if (process.env.MONGODB_URI) throw err;
  }

  if (process.env.MONGODB_URI) {
    throw new Error('Database is unavailable. Hero settings were not saved.');
  }

  inMemoryHeroSettings = {
    ...inMemoryHeroSettings,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  return inMemoryHeroSettings;
}
