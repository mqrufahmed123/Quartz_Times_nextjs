export interface IProductMedia {
  url: string;
  publicId?: string;
  alt?: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface IProductVideo {
  url: string;
  publicId?: string;
  thumbnailUrl?: string;
}

export interface IProductSpecifications {
  movement?: string; // Automatic, Manual Wind, Quartz, Solar, Co-Axial
  caseMaterial?: string; // 316L Stainless Steel, Titanium, Rose Gold, Ceramic
  strapMaterial?: string; // Genuine Leather, Oyster Steel, Rubber, NATO
  dialColor?: string; // Obsidian Black, Sunburst Blue, Champagne, Silver, Emerald Green
  waterResistance?: string; // 30m / 3 ATM, 100m / 10 ATM, 300m / 30 ATM
  caseDiameter?: string; // 39mm, 40mm, 41mm, 42mm
  crystal?: string; // Scratch-resistant Sapphire, Mineral Glass
  powerReserve?: string; // 40 Hours, 70 Hours, Battery
  warranty?: string; // 2 Years International, 1 Year In-House
  referenceNumber?: string; // e.g. 126610LN, 210.30.42.20.01.001
  condition?: string; // Brand New, Mint / Like New, Collector Grade
}

export interface IProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  brand: string;
  category: string; // e.g. "Automatic", "Quartz", "Vintage", "Chronograph", "Dive"
  description: string;
  story?: string;
  price: number;
  originalPrice?: number;
  currency: string; // default "INR"
  sku: string;
  stock: number;
  availability: 'in_stock' | 'reserved' | 'sold_out' | 'made_to_order';
  featured: boolean;
  isNewArrival?: boolean;
  status: 'active' | 'draft' | 'archived';
  specifications: IProductSpecifications;
  images: IProductMedia[];
  video?: IProductVideo;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ICategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  active: boolean;
  itemCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IInquiry {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email: string;
  product?: string;
  productId?: string;
  productSku?: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAdminUser {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt?: string | Date;
}

export interface IProductFilterQuery {
  category?: string;
  brand?: string;
  movement?: string;
  availability?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'newest' | 'price-low' | 'price-high';
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
