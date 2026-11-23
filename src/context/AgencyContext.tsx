import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  DEFAULT_SITE_SETTINGS,
  SAMPLE_GALLERY_IMAGES,
  SAMPLE_PROPERTIES,
} from '../data/seedData';
import {
  GalleryImage,
  Inquiry,
  InquiryStatus,
  Property,
  PropertyStatus,
  SiteSettings,
  StaffRole,
  UserProfile,
} from '../types';
import { generateSlug } from '../lib/formatters';

interface AgencyContextValue {
  user: User | null;
  authReady: boolean;
  staffRole: StaffRole | null;
  isStaff: boolean;
  isAdmin: boolean;
  properties: Property[];
  galleryImages: GalleryImage[];
  inquiries: Inquiry[];
  siteSettings: SiteSettings;
  staffProfiles: UserProfile[];
  usingFallbackData: boolean;
  loadingData: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  seedSamplePortfolio: () => Promise<void>;
  saveProperty: (
    data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'coverImageUrl'>,
    existingId?: string
  ) => Promise<string>;
  deleteProperty: (id: string) => Promise<void>;
  duplicateProperty: (property: Property) => Promise<string>;
  quickChangePropertyStatus: (id: string, status: PropertyStatus) => Promise<void>;
  createGalleryImage: (
    data: Omit<GalleryImage, 'id' | 'createdAt'>
  ) => Promise<string>;
  deleteGalleryImage: (id: string) => Promise<void>;
  submitInquiry: (input: {
    name: string;
    phone: string;
    email?: string;
    message: string;
    propertyId?: string | null;
    propertyTitle?: string | null;
    sourcePage: string;
    website?: string;
  }) => Promise<{ emailDelivered: boolean }>;
  updateInquiry: (id: string, status: InquiryStatus, notes: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  saveSiteSettings: (settings: Omit<SiteSettings, 'updatedAt'>) => Promise<void>;
  upsertStaffProfile: (uid: string, email: string, displayName: string, role: StaffRole) => Promise<void>;
  deleteStaffProfile: (uid: string) => Promise<void>;
}

const AgencyContext = createContext<AgencyContextValue | null>(null);

function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);

  const [liveProperties, setLiveProperties] = useState<Property[]>([]);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [liveGallery, setLiveGallery] = useState<GalleryImage[]>([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<UserProfile[]>([]);

  // Auth state listener & staff profile lookup
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setStaffRole(null);
        setAuthReady(true);
        return;
      }

      if (nextUser.email === BOOTSTRAP_ADMIN_EMAIL && nextUser.emailVerified) {
        setStaffRole('admin');
        setAuthReady(true);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, 'profiles', nextUser.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data() as { role?: StaffRole };
          setStaffRole(data.role === 'admin' || data.role === 'editor' ? data.role : null);
        } else {
          setStaffRole(null);
        }
      } catch {
        setStaffRole(null);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Public Firestore listeners: properties, gallery_images, site_settings
  useEffect(() => {
    const propQuery = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsubProps = onSnapshot(
      propQuery,
      (snap) => {
        const items: Property[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            title: String(raw.title || ''),
            slug: String(raw.slug || d.id),
            description: String(raw.description || ''),
            purpose: raw.purpose === 'rent' ? 'rent' : 'sale',
            type: raw.type || 'house',
            pricePkr: Number(raw.pricePkr || 0),
            areaValue: Number(raw.areaValue || 1),
            areaUnit: raw.areaUnit || 'marla',
            bedrooms: Number(raw.bedrooms || 0),
            bathrooms: Number(raw.bathrooms || 0),
            parking: Number(raw.parking || 0),
            furnished: raw.furnished || 'unfurnished',
            yearBuilt: typeof raw.yearBuilt === 'number' ? raw.yearBuilt : null,
            address: String(raw.address || ''),
            areaName: String(raw.areaName || ''),
            lat: typeof raw.lat === 'number' ? raw.lat : null,
            lng: typeof raw.lng === 'number' ? raw.lng : null,
            amenities: Array.isArray(raw.amenities) ? raw.amenities.map(String) : [],
            images: Array.isArray(raw.images) ? raw.images : [],
            coverImageUrl: String(raw.coverImageUrl || ''),
            status: raw.status || 'for_sale',
            featured: Boolean(raw.featured),
            isSample: Boolean(raw.isSample),
            createdAt: toIsoString(raw.createdAt),
            updatedAt: toIsoString(raw.updatedAt),
          };
        });
        setLiveProperties(items);
        setPropertiesLoaded(true);
      },
      (err) => {
        console.error('Properties listener warning:', err);
        setPropertiesLoaded(true);
      }
    );

    const galQuery = query(collection(db, 'gallery_images'), orderBy('createdAt', 'desc'));
    const unsubGallery = onSnapshot(
      galQuery,
      (snap) => {
        const items: GalleryImage[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            url: String(raw.url || ''),
            caption: String(raw.caption || ''),
            category: raw.category || 'Houses',
            propertyId: raw.propertyId ? String(raw.propertyId) : null,
            propertySlug: raw.propertySlug ? String(raw.propertySlug) : null,
            propertyTitle: raw.propertyTitle ? String(raw.propertyTitle) : null,
            isSample: Boolean(raw.isSample),
            createdAt: toIsoString(raw.createdAt),
          };
        });
        setLiveGallery(items);
        setGalleryLoaded(true);
      },
      (err) => {
        console.error('Gallery listener warning:', err);
        setGalleryLoaded(true);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'default'),
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data();
          setSiteSettings({
            agencyName: String(raw.agencyName || DEFAULT_SITE_SETTINGS.agencyName),
            phone: String(raw.phone || DEFAULT_SITE_SETTINGS.phone),
            whatsappNumber: String(raw.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsappNumber),
            address: String(raw.address || DEFAULT_SITE_SETTINGS.address),
            email: raw.email ? String(raw.email) : '',
            workingHours: raw.workingHours ? String(raw.workingHours) : DEFAULT_SITE_SETTINGS.workingHours,
            facebookUrl: raw.facebookUrl ? String(raw.facebookUrl) : '',
            instagramUrl: raw.instagramUrl ? String(raw.instagramUrl) : '',
            googleMapsUrl: String(raw.googleMapsUrl || DEFAULT_SITE_SETTINGS.googleMapsUrl),
            googleRating: Number(raw.googleRating ?? DEFAULT_SITE_SETTINGS.googleRating),
            reviewCount: Number(raw.reviewCount ?? DEFAULT_SITE_SETTINGS.reviewCount),
            heroHeadline: String(raw.heroHeadline || DEFAULT_SITE_SETTINGS.heroHeadline),
            heroSubheadline: String(raw.heroSubheadline || DEFAULT_SITE_SETTINGS.heroSubheadline),
            updatedAt: toIsoString(raw.updatedAt),
          });
        }
      },
      (err) => {
        console.error('Settings listener warning:', err);
      }
    );

    return () => {
      unsubProps();
      unsubGallery();
      unsubSettings();
    };
  }, []);

  // Admin-only listeners (inquiries and staff profiles)
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified || user.email !== BOOTSTRAP_ADMIN_EMAIL) {
      setInquiries([]);
      setStaffProfiles([]);
      return;
    }

    const inqQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubInq = onSnapshot(
      inqQuery,
      (snap) => {
        const items: Inquiry[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            name: String(raw.name || ''),
            phone: String(raw.phone || ''),
            email: raw.email ? String(raw.email) : null,
            message: String(raw.message || ''),
            propertyId: raw.propertyId ? String(raw.propertyId) : null,
            propertyTitle: raw.propertyTitle ? String(raw.propertyTitle) : null,
            sourcePage: String(raw.sourcePage || '/'),
            status: raw.status || 'new',
            notes: raw.notes ? String(raw.notes) : null,
            createdAt: toIsoString(raw.createdAt),
            updatedAt: toIsoString(raw.updatedAt),
          };
        });
        setInquiries(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'inquiries');
      }
    );

    const unsubProfiles = onSnapshot(
      collection(db, 'profiles'),
      (snap) => {
        const items: UserProfile[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            uid: String(raw.uid || d.id),
            email: String(raw.email || ''),
            displayName: String(raw.displayName || ''),
            role: raw.role === 'admin' ? 'admin' : 'editor',
            createdAt: toIsoString(raw.createdAt),
            updatedAt: toIsoString(raw.updatedAt),
          };
        });
        setStaffProfiles(items);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'profiles');
      }
    );

    return () => {
      unsubInq();
      unsubProfiles();
    };
  }, [authReady, user]);

  const usingFallbackData = propertiesLoaded && liveProperties.length === 0;
  const properties = usingFallbackData ? SAMPLE_PROPERTIES : liveProperties;
  const galleryImages =
    galleryLoaded && liveGallery.length === 0 ? SAMPLE_GALLERY_IMAGES : liveGallery;

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  const seedSamplePortfolio = async () => {
    try {
      await setDoc(doc(db, 'site_settings', 'default'), {
        agencyName: DEFAULT_SITE_SETTINGS.agencyName,
        phone: DEFAULT_SITE_SETTINGS.phone,
        whatsappNumber: DEFAULT_SITE_SETTINGS.whatsappNumber,
        address: DEFAULT_SITE_SETTINGS.address,
        email: DEFAULT_SITE_SETTINGS.email || null,
        workingHours: DEFAULT_SITE_SETTINGS.workingHours || null,
        facebookUrl: DEFAULT_SITE_SETTINGS.facebookUrl || null,
        instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl || null,
        googleMapsUrl: DEFAULT_SITE_SETTINGS.googleMapsUrl,
        googleRating: DEFAULT_SITE_SETTINGS.googleRating,
        reviewCount: DEFAULT_SITE_SETTINGS.reviewCount,
        heroHeadline: DEFAULT_SITE_SETTINGS.heroHeadline,
        heroSubheadline: DEFAULT_SITE_SETTINGS.heroSubheadline,
        updatedAt: serverTimestamp(),
      });

      for (const prop of SAMPLE_PROPERTIES) {
        await setDoc(doc(db, 'properties', prop.id), {
          title: prop.title,
          slug: prop.slug,
          description: prop.description,
          purpose: prop.purpose,
          type: prop.type,
          pricePkr: prop.pricePkr,
          areaValue: prop.areaValue,
          areaUnit: prop.areaUnit,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          parking: prop.parking,
          furnished: prop.furnished,
          yearBuilt: prop.yearBuilt ?? null,
          address: prop.address,
          areaName: prop.areaName,
          lat: prop.lat ?? null,
          lng: prop.lng ?? null,
          amenities: prop.amenities,
          images: prop.images,
          coverImageUrl: prop.coverImageUrl,
          status: prop.status,
          featured: prop.featured,
          isSample: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const img of SAMPLE_GALLERY_IMAGES) {
        await setDoc(doc(db, 'gallery_images', img.id), {
          url: img.url,
          caption: img.caption,
          category: img.category,
          propertyId: img.propertyId ?? null,
          propertySlug: img.propertySlug ?? null,
          propertyTitle: img.propertyTitle ?? null,
          isSample: true,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'properties');
    }
  };

  const saveProperty = async (
    data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'coverImageUrl'>,
    existingId?: string
  ): Promise<string> => {
    const coverImg = data.images.find((i) => i.isCover) || data.images[0];
    const coverImageUrl = coverImg.url;

    const payloadBase = {
      title: data.title.slice(0, 160),
      slug: data.slug.slice(0, 180),
      description: data.description.slice(0, 4000),
      purpose: data.purpose,
      type: data.type,
      pricePkr: Number(data.pricePkr),
      areaValue: Number(data.areaValue),
      areaUnit: data.areaUnit,
      bedrooms: Math.round(Number(data.bedrooms)),
      bathrooms: Math.round(Number(data.bathrooms)),
      parking: Math.round(Number(data.parking)),
      furnished: data.furnished,
      yearBuilt: data.yearBuilt ? Math.round(Number(data.yearBuilt)) : null,
      address: data.address.slice(0, 240),
      areaName: data.areaName.slice(0, 120),
      lat: typeof data.lat === 'number' && !Number.isNaN(data.lat) ? data.lat : null,
      lng: typeof data.lng === 'number' && !Number.isNaN(data.lng) ? data.lng : null,
      amenities: data.amenities.slice(0, 25),
      images: data.images.slice(0, 12),
      coverImageUrl: coverImageUrl.slice(0, 500),
      status: data.status,
      featured: Boolean(data.featured),
      isSample: Boolean(data.isSample),
    };

    try {
      if (existingId) {
        await updateDoc(doc(db, 'properties', existingId), {
          ...payloadBase,
          updatedAt: serverTimestamp(),
        });
        return existingId;
      } else {
        const newId = makeDocId('prop');
        await setDoc(doc(db, 'properties', newId), {
          ...payloadBase,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return newId;
      }
    } catch (err) {
      handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, `properties/${existingId || 'new'}`);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `properties/${id}`);
    }
  };

  const duplicateProperty = async (property: Property): Promise<string> => {
    const copyTitle = `${property.title} (Copy)`.slice(0, 160);
    const copySlug = `${generateSlug(property.title)}-${Date.now().toString().slice(-4)}`.slice(0, 180);
    return saveProperty({
      title: copyTitle,
      slug: copySlug,
      description: property.description,
      purpose: property.purpose,
      type: property.type,
      pricePkr: property.pricePkr,
      areaValue: property.areaValue,
      areaUnit: property.areaUnit,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking: property.parking,
      furnished: property.furnished,
      yearBuilt: property.yearBuilt ?? null,
      address: property.address,
      areaName: property.areaName,
      lat: property.lat ?? null,
      lng: property.lng ?? null,
      amenities: property.amenities,
      images: property.images,
      status: property.status,
      featured: false,
      isSample: property.isSample,
    });
  };

  const quickChangePropertyStatus = async (id: string, status: PropertyStatus) => {
    try {
      await updateDoc(doc(db, 'properties', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${id}`);
    }
  };

  const createGalleryImage = async (
    data: Omit<GalleryImage, 'id' | 'createdAt'>
  ): Promise<string> => {
    const newId = makeDocId('gal');
    try {
      await setDoc(doc(db, 'gallery_images', newId), {
        url: data.url.slice(0, 500),
        caption: data.caption.slice(0, 240),
        category: data.category,
        propertyId: data.propertyId ?? null,
        propertySlug: data.propertySlug ?? null,
        propertyTitle: data.propertyTitle ?? null,
        isSample: Boolean(data.isSample),
        createdAt: serverTimestamp(),
      });
      return newId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `gallery_images/${newId}`);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery_images', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery_images/${id}`);
    }
  };

  const submitInquiry = async (input: {
    name: string;
    phone: string;
    email?: string;
    message: string;
    propertyId?: string | null;
    propertyTitle?: string | null;
    sourcePage: string;
    website?: string;
  }) => {
    // Server-side rate limiting, honeypot check, and email notification
    const apiRes = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const apiJson = (await apiRes.json()) as {
      ok?: boolean;
      error?: string;
      spamFiltered?: boolean;
      emailDelivered?: boolean;
    };

    if (!apiRes.ok) {
      throw new Error(apiJson.error || 'Could not submit inquiry.');
    }

    if (apiJson.spamFiltered) {
      return { emailDelivered: false };
    }

    const inquiryId = makeDocId('inq');
    try {
      await setDoc(doc(db, 'inquiries', inquiryId), {
        name: input.name.trim().slice(0, 120),
        phone: input.phone.trim().slice(0, 30),
        email: input.email?.trim() ? input.email.trim().slice(0, 160) : null,
        message: input.message.trim().slice(0, 2000),
        propertyId: input.propertyId ? input.propertyId.slice(0, 128) : null,
        propertyTitle: input.propertyTitle ? input.propertyTitle.slice(0, 160) : null,
        sourcePage: input.sourcePage.slice(0, 160),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiryId}`);
    }

    return { emailDelivered: Boolean(apiJson.emailDelivered) };
  };

  const updateInquiry = async (id: string, status: InquiryStatus, notes: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status,
        notes: notes.slice(0, 2000),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const saveSiteSettings = async (settings: Omit<SiteSettings, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'site_settings', 'default'), {
        agencyName: settings.agencyName.slice(0, 160),
        phone: settings.phone.slice(0, 40),
        whatsappNumber: settings.whatsappNumber.slice(0, 40),
        address: settings.address.slice(0, 300),
        email: settings.email?.trim() ? settings.email.trim().slice(0, 160) : null,
        workingHours: settings.workingHours?.trim() ? settings.workingHours.trim().slice(0, 160) : null,
        facebookUrl: settings.facebookUrl?.trim() ? settings.facebookUrl.trim().slice(0, 300) : null,
        instagramUrl: settings.instagramUrl?.trim() ? settings.instagramUrl.trim().slice(0, 300) : null,
        googleMapsUrl: settings.googleMapsUrl.slice(0, 300),
        googleRating: Number(settings.googleRating),
        reviewCount: Math.round(Number(settings.reviewCount)),
        heroHeadline: settings.heroHeadline.slice(0, 160),
        heroSubheadline: settings.heroSubheadline.slice(0, 320),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'site_settings/default');
    }
  };

  const upsertStaffProfile = async (
    uid: string,
    email: string,
    displayName: string,
    role: StaffRole
  ) => {
    try {
      const ref = doc(db, 'profiles', uid);
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        await updateDoc(ref, {
          displayName: displayName.slice(0, 120),
          role,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          uid,
          email: email.slice(0, 160),
          displayName: displayName.slice(0, 120),
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `profiles/${uid}`);
    }
  };

  const deleteStaffProfile = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'profiles', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `profiles/${uid}`);
    }
  };

  const value = useMemo<AgencyContextValue>(
    () => ({
      user,
      authReady,
      staffRole,
      isStaff: staffRole === 'admin' || staffRole === 'editor',
      isAdmin: staffRole === 'admin',
      properties,
      galleryImages,
      inquiries,
      siteSettings,
      staffProfiles,
      usingFallbackData,
      loadingData: !propertiesLoaded,
      signInWithGoogle,
      signOutUser,
      getIdToken,
      seedSamplePortfolio,
      saveProperty,
      deleteProperty,
      duplicateProperty,
      quickChangePropertyStatus,
      createGalleryImage,
      deleteGalleryImage,
      submitInquiry,
      updateInquiry,
      deleteInquiry,
      saveSiteSettings,
      upsertStaffProfile,
      deleteStaffProfile,
    }),
    [
      user,
      authReady,
      staffRole,
      properties,
      galleryImages,
      inquiries,
      siteSettings,
      staffProfiles,
      usingFallbackData,
      propertiesLoaded,
    ]
  );

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}

export function useAgency() {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error('useAgency must be used within AgencyProvider');
  return ctx;
}
