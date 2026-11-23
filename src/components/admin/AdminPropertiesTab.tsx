import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { COMMON_AMENITIES } from '../../data/seedData';
import { formatPkr, formatStatusLabel, formatTypeLabel, generateSlug } from '../../lib/formatters';
import { propertyFormSchema } from '../../lib/validation';
import {
  AreaUnit,
  FurnishedStatus,
  Property,
  PropertyImage,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from '../../types';
import { uploadCompressedImage } from './imageUtils';
import { ImageStudioModal } from '../ImageStudioModal';

const PAGE_SIZE = 10;

interface PropertyDraft {
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
  yearBuilt: string;
  address: string;
  areaName: string;
  lat: string;
  lng: string;
  amenities: string[];
  images: PropertyImage[];
  status: PropertyStatus;
  featured: boolean;
  isSample: boolean;
}

function emptyDraft(): PropertyDraft {
  return {
    title: '',
    slug: '',
    description: '',
    purpose: 'sale',
    type: 'house',
    pricePkr: 0,
    areaValue: 10,
    areaUnit: 'marla',
    bedrooms: 3,
    bathrooms: 3,
    parking: 1,
    furnished: 'unfurnished',
    yearBuilt: '',
    address: '',
    areaName: '',
    lat: '',
    lng: '',
    amenities: ['Electricity', '24/7 water supply'],
    images: [],
    status: 'for_sale',
    featured: false,
    isSample: false,
  };
}

function propertyToDraft(p: Property): PropertyDraft {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description,
    purpose: p.purpose,
    type: p.type,
    pricePkr: p.pricePkr,
    areaValue: p.areaValue,
    areaUnit: p.areaUnit,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parking: p.parking,
    furnished: p.furnished,
    yearBuilt: p.yearBuilt ? String(p.yearBuilt) : '',
    address: p.address,
    areaName: p.areaName,
    lat: typeof p.lat === 'number' ? String(p.lat) : '',
    lng: typeof p.lng === 'number' ? String(p.lng) : '',
    amenities: p.amenities,
    images: p.images,
    status: p.status,
    featured: p.featured,
    isSample: p.isSample,
  };
}

export function AdminPropertiesTab() {
  const {
    properties,
    usingFallbackData,
    getIdToken,
    saveProperty,
    deleteProperty,
    duplicateProperty,
    quickChangePropertyStatus,
  } = useAgency();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [purposeFilter, setPurposeFilter] = useState<'all' | PropertyPurpose>('all');
  const [page, setPage] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<PropertyDraft>(emptyDraft());
  const [slugManual, setSlugManual] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [studioOpen, setStudioOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (purposeFilter !== 'all' && p.purpose !== purposeFilter) return false;
      if (q && !`${p.title} ${p.areaName} ${p.address}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [properties, search, statusFilter, purposeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setSlugManual(false);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p.id);
    setDraft(propertyToDraft(p));
    setSlugManual(true);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFormError(null);
    const remainingSlots = 12 - draft.images.length;
    if (remainingSlots <= 0) {
      setFormError('Maximum 12 images per property.');
      return;
    }

    const token = await getIdToken();
    if (!token) {
      setFormError('Please sign in again to upload images.');
      return;
    }

    const batch = Array.from(files).slice(0, remainingSlots);
    setUploadingCount(batch.length);

    try {
      const uploaded: PropertyImage[] = [];
      for (const file of batch) {
        const url = await uploadCompressedImage(file, token);
        uploaded.push({
          url,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          isCover: false,
        });
      }
      setDraft((prev) => {
        const merged = [...prev.images, ...uploaded];
        if (!merged.some((i) => i.isCover) && merged[0]) {
          merged[0] = { ...merged[0], isCover: true };
        }
        return { ...prev, images: merged };
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingCount(0);
    }
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= draft.images.length) return;
    setDraft((prev) => {
      const next = [...prev.images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, images: next };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = propertyFormSchema.safeParse({
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      purpose: draft.purpose,
      type: draft.type,
      pricePkr: Number(draft.pricePkr),
      areaValue: Number(draft.areaValue),
      areaUnit: draft.areaUnit,
      bedrooms: Math.round(Number(draft.bedrooms)),
      bathrooms: Math.round(Number(draft.bathrooms)),
      parking: Math.round(Number(draft.parking)),
      furnished: draft.furnished,
      yearBuilt: draft.yearBuilt ? Math.round(Number(draft.yearBuilt)) : null,
      address: draft.address,
      areaName: draft.areaName,
      lat: draft.lat ? Number(draft.lat) : null,
      lng: draft.lng ? Number(draft.lng) : null,
      amenities: draft.amenities,
      images: draft.images.map((img, i) => ({
        url: img.url,
        alt: img.alt || draft.title || `Property photo ${i + 1}`,
        isCover: img.isCover,
      })),
      status: draft.status,
      featured: draft.featured,
      isSample: draft.isSample,
    });

    if (!parsed.success) {
      const firstErr = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setFormError(firstErr || 'Please review all required fields.');
      return;
    }

    setSaving(true);
    try {
      await saveProperty(parsed.data, editingId || undefined);
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            Properties ({filtered.length})
          </h2>
          {usingFallbackData && (
            <p className="text-xs text-[#4A5568] mt-1">
              Currently previewing local sample placeholders. Seed them to Firestore on the Dashboard or add a new property.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
          <span>Add property</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#12284A]/10 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search
            className="w-4 h-4 text-[#4A5568] absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, locality, or address..."
            className="w-full pl-9 pr-3 py-2 border border-[#12284A]/20 text-xs text-[#12284A]"
          />
        </div>

        <select
          value={purposeFilter}
          onChange={(e) => {
            setPurposeFilter(e.target.value as 'all' | PropertyPurpose);
            setPage(1);
          }}
          className="px-3 py-2 border border-[#12284A]/20 text-xs text-[#12284A] bg-white"
        >
          <option value="all">All purposes</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | PropertyStatus);
            setPage(1);
          }}
          className="px-3 py-2 border border-[#12284A]/20 text-xs text-[#12284A] bg-white"
        >
          <option value="all">All statuses</option>
          <option value="for_sale">For sale</option>
          <option value="for_rent">For rent</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#12284A]/10 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#12284A]/10 text-[#4A5568] bg-[#F5F6F8]">
              <th className="py-3 px-4 font-medium">Property</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium text-right">Price</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Featured</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#12284A]/10">
            {paginated.map((prop) => (
              <tr key={prop.id} className="hover:bg-[#F5F6F8]/60">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prop.coverImageUrl}
                      alt={prop.title}
                      className="w-12 h-9 object-cover bg-[#E8ECF2] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#12284A] truncate max-w-xs">{prop.title}</p>
                      <p className="text-[#4A5568] truncate">{prop.areaName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#4A5568]">{formatTypeLabel(prop.type)}</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-[#12284A]">
                  {formatPkr(prop.pricePkr, prop.purpose)}
                </td>
                <td className="py-3 px-4">
                  <select
                    aria-label={`Change status for ${prop.title}`}
                    disabled={usingFallbackData}
                    value={prop.status}
                    onChange={(e) =>
                      void quickChangePropertyStatus(prop.id, e.target.value as PropertyStatus)
                    }
                    className="px-2 py-1 border border-[#12284A]/20 bg-white text-xs text-[#12284A]"
                  >
                    <option value="for_sale">{formatStatusLabel('for_sale')}</option>
                    <option value="for_rent">{formatStatusLabel('for_rent')}</option>
                    <option value="sold">{formatStatusLabel('sold')}</option>
                    <option value="rented">{formatStatusLabel('rented')}</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {prop.featured ? (
                    <span className="inline-flex items-center gap-1 text-[#12284A] font-medium">
                      <Star className="w-3.5 h-3.5 fill-[#C9B27C] text-[#C9B27C]" aria-hidden="true" />
                      <span>Yes</span>
                    </span>
                  ) : (
                    <span className="text-[#4A5568]">No</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(prop)}
                      title="Edit property"
                      aria-label={`Edit ${prop.title}`}
                      className="p-1.5 border border-[#12284A]/15 text-[#12284A] hover:border-[#12284A]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicateProperty(prop)}
                      title="Duplicate property"
                      aria-label={`Duplicate ${prop.title}`}
                      className="p-1.5 border border-[#12284A]/15 text-[#12284A] hover:border-[#12284A]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={usingFallbackData}
                      onClick={() => setConfirmDeleteId(prop.id)}
                      title="Delete property"
                      aria-label={`Delete ${prop.title}`}
                      className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-[#12284A]/20 bg-white text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 py-1.5 text-xs tabular-nums text-[#4A5568]">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-[#12284A]/20 bg-white text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0D1E38]/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#12284A]/15 max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#12284A]">
              Delete property listing?
            </h3>
            <p className="text-xs text-[#4A5568]">
              This action permanently removes the listing from Firestore. Existing inquiries referencing it remain intact.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDeleteId;
                  setConfirmDeleteId(null);
                  await deleteProperty(target);
                }}
                className="px-4 py-2 bg-red-700 text-white text-xs font-medium hover:bg-red-800"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer Modal */}
      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit property' : 'Add property'}
          className="fixed inset-0 z-50 bg-[#0D1E38]/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#12284A]/15 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#12284A]/10 pb-4">
              <h3 className="font-serif text-2xl font-semibold text-[#12284A]">
                {editingId ? 'Edit property' : 'Add new property'}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close property form"
                className="p-1.5 text-[#4A5568] hover:text-[#12284A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Property title *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        title: val,
                        slug: slugManual ? prev.slug : generateSlug(val),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setDraft((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
                    }}
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs font-mono text-[#12284A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Purpose</label>
                    <select
                      value={draft.purpose}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          purpose: e.target.value as PropertyPurpose,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                    >
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Status</label>
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          status: e.target.value as PropertyStatus,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                    >
                      <option value="for_sale">For sale</option>
                      <option value="for_rent">For rent</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Property type
                  </label>
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, type: e.target.value as PropertyType }))
                    }
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                  >
                    <option value="house">House</option>
                    <option value="plot">Plot</option>
                    <option value="apartment">Apartment</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                    <option value="agricultural_land">Agricultural land</option>
                    <option value="commercial_building">Commercial building</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Price in PKR ({formatPkr(Number(draft.pricePkr || 0), draft.purpose)})
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={draft.pricePkr}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, pricePkr: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-sm tabular-nums"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">
                      Area size
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.1}
                      required
                      value={draft.areaValue}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, areaValue: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Unit</label>
                    <select
                      value={draft.areaUnit}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, areaUnit: e.target.value as AreaUnit }))
                      }
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                    >
                      <option value="marla">Marla</option>
                      <option value="kanal">Kanal</option>
                      <option value="sq_ft">sq ft</option>
                      <option value="acre">Acre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Beds</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={draft.bedrooms}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, bedrooms: Number(e.target.value) }))
                      }
                      className="w-full px-2.5 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Baths</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={draft.bathrooms}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, bathrooms: Number(e.target.value) }))
                      }
                      className="w-full px-2.5 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">Parking</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={draft.parking}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, parking: Number(e.target.value) }))
                      }
                      className="w-full px-2.5 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">
                      Furnishing
                    </label>
                    <select
                      value={draft.furnished}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          furnished: e.target.value as FurnishedStatus,
                        }))
                      }
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi_furnished">Semi-furnished</option>
                      <option value="furnished">Furnished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#12284A] mb-1">
                      Year built
                    </label>
                    <input
                      type="number"
                      min={1950}
                      max={2035}
                      value={draft.yearBuilt}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, yearBuilt: e.target.value }))
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.areaName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, areaName: e.target.value }))}
                    placeholder="e.g. Rana Town, Ferozewala"
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Full street / sector address *
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.address}
                    onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Latitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={draft.lat}
                    onChange={(e) => setDraft((prev) => ({ ...prev, lat: e.target.value }))}
                    placeholder="31.6921"
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Longitude (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={draft.lng}
                    onChange={(e) => setDraft((prev) => ({ ...prev, lng: e.target.value }))}
                    placeholder="74.2945"
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-xs tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#12284A] mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 pt-2 border-t border-[#12284A]/10">
                <p className="text-xs font-medium text-[#12284A]">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map((item) => {
                    const checked = draft.amenities.includes(item);
                    return (
                      <label
                        key={item}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-xs cursor-pointer ${
                          checked
                            ? 'bg-[#12284A] text-white border-[#12284A]'
                            : 'bg-white text-[#4A5568] border-[#12284A]/15'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() =>
                            setDraft((prev) => ({
                              ...prev,
                              amenities: checked
                                ? prev.amenities.filter((a) => a !== item)
                                : [...prev.amenities, item].slice(0, 25),
                            }))
                          }
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3 py-1.5 border border-[#12284A]/20 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = customAmenity.trim();
                      if (trimmed && !draft.amenities.includes(trimmed)) {
                        setDraft((prev) => ({
                          ...prev,
                          amenities: [...prev.amenities, trimmed].slice(0, 25),
                        }));
                        setCustomAmenity('');
                      }
                    }}
                    className="px-3 py-1.5 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Images Upload, Compression, Reorder & AI Studio */}
              <div className="space-y-3 pt-4 border-t border-[#12284A]/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-[#12284A]">
                      Property Photos ({draft.images.length}/12)
                    </p>
                    <p className="text-xs text-[#4A5568]">
                      JPG, PNG, or WebP up to 15 MB each. Automatically resized and compressed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStudioOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#12284A]/20 text-xs font-medium text-[#12284A] hover:border-[#12284A]"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
                    <span>Create or edit image with AI</span>
                  </button>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void handleFiles(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-[#12284A]/20 bg-[#F5F6F8] p-6 text-center space-y-2"
                >
                  <Upload className="w-5 h-5 mx-auto text-[#C9B27C]" aria-hidden="true" />
                  <p className="text-xs text-[#4A5568]">
                    Drag and drop images here, or{' '}
                    <label className="text-[#12284A] font-medium underline cursor-pointer">
                      browse files
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => void handleFiles(e.target.files)}
                      />
                    </label>
                  </p>
                  {uploadingCount > 0 && (
                    <p className="text-xs text-[#12284A] font-medium">
                      Compressing and uploading {uploadingCount} image(s)...
                    </p>
                  )}
                </div>

                {draft.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {draft.images.map((img, idx) => (
                      <div
                        key={`${img.url}-${idx}`}
                        draggable
                        onDragStart={() => setDragIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex !== null && dragIndex !== idx) {
                            moveImage(dragIndex, idx);
                          }
                          setDragIndex(null);
                        }}
                        className="flex gap-3 p-3 bg-white border border-[#12284A]/15 items-start"
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-20 h-16 object-cover shrink-0 bg-[#E8ECF2]"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            type="text"
                            value={img.alt}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                images: prev.images.map((item, i) =>
                                  i === idx ? { ...item, alt: e.target.value } : item
                                ),
                              }))
                            }
                            placeholder="Descriptive alt text..."
                            className="w-full px-2 py-1 border border-[#12284A]/15 text-xs"
                          />
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({
                                  ...prev,
                                  images: prev.images.map((item, i) => ({
                                    ...item,
                                    isCover: i === idx,
                                  })),
                                }))
                              }
                              className={`px-2 py-0.5 border ${
                                img.isCover
                                  ? 'bg-[#12284A] text-white border-[#12284A]'
                                  : 'text-[#4A5568] border-[#12284A]/15'
                              }`}
                            >
                              {img.isCover ? 'Cover photo' : 'Set cover'}
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx - 1)}
                              disabled={idx === 0}
                              aria-label="Move image up"
                              className="p-1 border border-[#12284A]/15 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx + 1)}
                              disabled={idx === draft.images.length - 1}
                              aria-label="Move image down"
                              className="p-1 border border-[#12284A]/15 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => {
                                  const filteredImgs = prev.images.filter((_, i) => i !== idx);
                                  if (
                                    filteredImgs.length > 0 &&
                                    !filteredImgs.some((item) => item.isCover)
                                  ) {
                                    filteredImgs[0] = { ...filteredImgs[0], isCover: true };
                                  }
                                  return { ...prev, images: filteredImgs };
                                })
                              }
                              className="text-red-700 hover:underline ml-auto"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#12284A]/10 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                  />
                  <span className="font-medium text-[#12284A]">
                    Feature on homepage (up to 6 shown)
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.isSample}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, isSample: e.target.checked }))
                    }
                  />
                  <span className="text-[#4A5568]">Mark as sample placeholder</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#12284A]/10">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-5 py-2.5 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-60"
                >
                  {saving ? 'Saving property...' : editingId ? 'Save changes' : 'Create property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studioOpen && (
        <ImageStudioModal
          onClose={() => setStudioOpen(false)}
          onSaveUrl={(url, caption) => {
            setDraft((prev) => {
              const next: PropertyImage[] = [
                ...prev.images,
                { url, alt: caption || prev.title || 'Property visual', isCover: prev.images.length === 0 },
              ];
              return { ...prev, images: next.slice(0, 12) };
            });
          }}
        />
      )}
    </div>
  );
}
