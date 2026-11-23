import { z } from 'zod';

// Volumetric boundaries synchronized verbatim with firebase-blueprint.json
export const FIELD_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 160,
  SLUG_MIN: 3,
  SLUG_MAX: 180,
  SLUG_REGEX: /^[a-z0-9-]+$/,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 4000,
  ADDRESS_MIN: 3,
  ADDRESS_MAX: 240,
  AREA_NAME_MIN: 2,
  AREA_NAME_MAX: 120,
  MAX_AMENITIES: 25,
  MAX_IMAGES: 12,
  URL_MAX: 500,
  CAPTION_MIN: 2,
  CAPTION_MAX: 240,
  INQUIRY_NAME_MIN: 2,
  INQUIRY_NAME_MAX: 120,
  INQUIRY_PHONE_MIN: 7,
  INQUIRY_PHONE_MAX: 30,
  EMAIL_MAX: 160,
  INQUIRY_MESSAGE_MIN: 5,
  INQUIRY_MESSAGE_MAX: 2000,
  NOTES_MAX: 2000,
} as const;

export const propertyImageSchema = z.object({
  url: z.string().trim().min(1).max(FIELD_LIMITS.URL_MAX),
  alt: z.string().trim().min(1).max(FIELD_LIMITS.CAPTION_MAX),
  isCover: z.boolean(),
});

export const propertyFormSchema = z.object({
  title: z.string().trim().min(FIELD_LIMITS.TITLE_MIN).max(FIELD_LIMITS.TITLE_MAX),
  slug: z
    .string()
    .trim()
    .min(FIELD_LIMITS.SLUG_MIN)
    .max(FIELD_LIMITS.SLUG_MAX)
    .regex(FIELD_LIMITS.SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  description: z.string().trim().min(FIELD_LIMITS.DESCRIPTION_MIN).max(FIELD_LIMITS.DESCRIPTION_MAX),
  purpose: z.enum(['sale', 'rent']),
  type: z.enum([
    'house',
    'plot',
    'apartment',
    'shop',
    'office',
    'agricultural_land',
    'commercial_building',
  ]),
  pricePkr: z.number().min(0).max(100_000_000_000),
  areaValue: z.number().positive().max(1_000_000),
  areaUnit: z.enum(['marla', 'kanal', 'sq_ft', 'acre']),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  parking: z.number().int().min(0).max(50),
  furnished: z.enum(['unfurnished', 'semi_furnished', 'furnished']),
  yearBuilt: z.number().int().min(1950).max(2035).nullable().optional(),
  address: z.string().trim().min(FIELD_LIMITS.ADDRESS_MIN).max(FIELD_LIMITS.ADDRESS_MAX),
  areaName: z.string().trim().min(FIELD_LIMITS.AREA_NAME_MIN).max(FIELD_LIMITS.AREA_NAME_MAX),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  amenities: z.array(z.string().trim().min(1).max(60)).max(FIELD_LIMITS.MAX_AMENITIES),
  images: z.array(propertyImageSchema).min(1, 'At least one image is required.').max(FIELD_LIMITS.MAX_IMAGES),
  status: z.enum(['for_sale', 'for_rent', 'sold', 'rented']),
  featured: z.boolean(),
  isSample: z.boolean(),
});

export const inquiryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(FIELD_LIMITS.INQUIRY_NAME_MIN, 'Please enter your full name.')
    .max(FIELD_LIMITS.INQUIRY_NAME_MAX),
  phone: z
    .string()
    .trim()
    .min(FIELD_LIMITS.INQUIRY_PHONE_MIN, 'Please enter a valid phone or WhatsApp number.')
    .max(FIELD_LIMITS.INQUIRY_PHONE_MAX),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(FIELD_LIMITS.EMAIL_MAX)
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(FIELD_LIMITS.INQUIRY_MESSAGE_MIN, 'Please share a few details about what you are looking for.')
    .max(FIELD_LIMITS.INQUIRY_MESSAGE_MAX),
  website: z.string().max(100).optional(), // honeypot
});

export const galleryImageSchema = z.object({
  url: z.string().trim().min(1).max(FIELD_LIMITS.URL_MAX),
  caption: z.string().trim().min(FIELD_LIMITS.CAPTION_MIN).max(FIELD_LIMITS.CAPTION_MAX),
  category: z.enum(['Houses', 'Plots', 'Commercial', 'Projects']),
  propertyId: z.string().trim().max(128).nullable().optional(),
  propertySlug: z.string().trim().max(180).nullable().optional(),
  propertyTitle: z.string().trim().max(160).nullable().optional(),
  isSample: z.boolean(),
});

export const siteSettingsSchema = z.object({
  agencyName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(40),
  whatsappNumber: z.string().trim().min(7).max(40),
  address: z.string().trim().min(5).max(300),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  workingHours: z.string().trim().max(160).optional().or(z.literal('')),
  facebookUrl: z.string().trim().max(300).optional().or(z.literal('')),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal('')),
  googleMapsUrl: z.string().trim().url().max(300),
  googleRating: z.number().min(1).max(5),
  reviewCount: z.number().int().min(0),
  heroHeadline: z.string().trim().min(5).max(160),
  heroSubheadline: z.string().trim().min(5).max(320),
});
