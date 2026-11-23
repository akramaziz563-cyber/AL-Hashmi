import { useState } from 'react';
import { Trash2, Upload, Wand2 } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { GalleryCategory } from '../../types';
import { uploadCompressedImage } from './imageUtils';
import { ImageStudioModal } from '../ImageStudioModal';

export function AdminGalleryTab() {
  const {
    galleryImages,
    properties,
    usingFallbackData,
    getIdToken,
    createGalleryImage,
    deleteGalleryImage,
  } = useAgency();

  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('Houses');
  const [linkedPropertyId, setLinkedPropertyId] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Staff sign-in required.');
      const url = await uploadCompressedImage(file, token);
      setUploadedUrl(url);
      if (!caption) {
        setCaption(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!uploadedUrl) {
      setError('Please upload or generate an image first.');
      return;
    }
    if (caption.trim().length < 2) {
      setError('Please add a brief caption.');
      return;
    }
    const linked = properties.find((p) => p.id === linkedPropertyId);
    setSaving(true);
    try {
      await createGalleryImage({
        url: uploadedUrl,
        caption: caption.trim(),
        category,
        propertyId: linked?.id ?? null,
        propertySlug: linked?.slug ?? null,
        propertyTitle: linked?.title ?? null,
        isSample: false,
      });
      setUploadedUrl('');
      setCaption('');
      setLinkedPropertyId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery photo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white border border-[#12284A]/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            Add gallery photograph
          </h2>
          <button
            type="button"
            onClick={() => setStudioOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
            <span>Create with AI Studio</span>
          </button>
        </div>

        {error && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Photo file *</label>
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-[#12284A]/20 bg-[#F5F6F8] text-xs font-medium text-[#12284A] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
              <span>{uploading ? 'Uploading...' : uploadedUrl ? 'Photo ready' : 'Choose JPG/PNG/WebP'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
            >
              <option value="Houses">Houses</option>
              <option value="Plots">Plots</option>
              <option value="Commercial">Commercial</option>
              <option value="Projects">Projects</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Caption *</label>
            <input
              type="text"
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Front elevation..."
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">
              Link to property (optional)
            </label>
            <select
              value={linkedPropertyId}
              onChange={(e) => setLinkedPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
            >
              <option value="">None</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {uploadedUrl && (
          <img
            src={uploadedUrl}
            alt="Gallery preview"
            className="h-28 w-40 object-cover border border-[#12284A]/10"
          />
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-5 py-2 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add to gallery'}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {galleryImages.map((img) => (
          <div key={img.id} className="bg-white border border-[#12284A]/10 overflow-hidden">
            <img
              src={img.url}
              alt={img.caption}
              className="w-full aspect-[4/3] object-cover bg-[#E8ECF2]"
            />
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[#C9B27C]">{img.category}</span>
                <p className="text-xs font-medium text-[#12284A] mt-0.5">{img.caption}</p>
                {img.propertyTitle && (
                  <p className="text-[11px] text-[#4A5568] truncate mt-1">
                    Linked: {img.propertyTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={usingFallbackData}
                onClick={() => void deleteGalleryImage(img.id)}
                aria-label={`Delete gallery image ${img.caption}`}
                className="p-1.5 border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {studioOpen && (
        <ImageStudioModal
          onClose={() => setStudioOpen(false)}
          onSaveUrl={(url, generatedCaption) => {
            setUploadedUrl(url);
            if (!caption) setCaption(generatedCaption);
          }}
        />
      )}
    </div>
  );
}
