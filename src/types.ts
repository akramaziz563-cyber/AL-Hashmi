export type PropertyPurpose = 'sale' | 'rent';

export type PropertyType =
  | 'house'
  | 'plot'
  | 'apartment'
  | 'shop'
  | 'office'
  | 'agricultural_land'
  | 'commercial_building';

export type PropertyStatus = 'for_sale' | 'for_rent' | 'sold' | 'rented';

export type AreaUnit = 'marla' | 'kanal' | 'sq_ft' | 'acre';

export type FurnishedStatus = 'unfurnished' | 'semi_furnished' | 'furnished';

export type GalleryCategory = 'Houses' | 'Plots' | 'Commercial' | 'Projects';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type StaffRole = 'admin' | 'editor';

export interface PropertyImage {
  url: string;
  alt: string;
  isCover: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  purpose: PropertyPurpose;
  type: PropertyType;
  pricePkr: number;
  areaValue: number;
  areaUnit: AreaUnit;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnished: FurnishedStatus;
  yearBuilt?: number | null;
  address: string;
  areaName: string;
  lat?: number | null;
  lng?: number | null;
  amenities: string[];
  images: PropertyImage[];
  coverImageUrl: string;
  status: PropertyStatus;
  featured: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: GalleryCategory;
  propertyId?: string | null;
  propertySlug?: string | null;
  propertyTitle?: string | null;
  isSample: boolean;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  propertyId?: string | null;
  propertyTitle?: string | null;
  sourcePage: string;
  status: InquiryStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  agencyName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  email?: string | null;
  workingHours?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  googleMapsUrl: string;
  googleRating: number;
  reviewCount: number;
  heroHeadline: string;
  heroSubheadline: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: StaffRole;
  createdAt: string;
  updatedAt: string;
}

export interface MapsInsightPlace {
  title: string;
  uri: string;
  snippets: string[];
}

export interface MapsInsightResult {
  summary: string;
  places: MapsInsightPlace[];
}
