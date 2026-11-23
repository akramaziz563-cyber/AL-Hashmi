import { useState } from 'react';
import { Loader2, Upload, Wand2, X } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';

interface ImageStudioModalProps {
  onClose: () => void;
  onSaveUrl: (url: string, caption: string) => void;
}

export function ImageStudioModal({ onClose, onSaveUrl }: ImageStudioModalProps) {
  const { getIdToken } = useAgency();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9' | '1:1' | '3:4'>('4:3');
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [sourceMime, setSourceMime] = useState<'image/jpeg' | 'image/png' | 'image/webp' | null>(null);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSourceFile = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Source image must be 15 MB or smaller.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const match = result.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
      if (match) {
        setSourceMime(match[1] as 'image/jpeg' | 'image/png' | 'image/webp');
        setSourceBase64(match[2]);
        setSourcePreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 5) {
      setError('Please describe the image you want to create or edit (at least 5 characters).');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Staff sign-in required.');

      const res = await fetch('/api/ai/image-studio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          sourceImageBase64: sourceBase64,
          sourceMimeType: sourceMime,
        }),
      });
      const json = (await res.json()) as { dataUrl?: string; error?: string };
      if (!res.ok || !json.dataUrl) {
        throw new Error(json.error || 'Could not generate image.');
      }
      setGeneratedDataUrl(json.dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!generatedDataUrl) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Staff sign-in required.');

      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataUrl: generatedDataUrl,
          fileName: 'studio-image.png',
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Unable to store generated image.');
      }
      onSaveUrl(json.url, prompt.trim().slice(0, 180));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save image.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Property Image Studio"
      className="fixed inset-0 z-50 bg-[#0D1E38]/75 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-[#12284A]/15 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#12284A]/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
              Property Image Studio
            </h2>
            <p className="text-xs text-[#4A5568] mt-1">
              Create or edit property visuals from a text prompt using Gemini Nano Banana 2.1.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image studio"
            className="p-1.5 text-[#4A5568] hover:text-[#12284A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1.5">
              Optional reference photo (for editing / virtual staging)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A] hover:border-[#12284A] cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{sourcePreview ? 'Change photo' : 'Upload base photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleSourceFile(file);
                  }}
                />
              </label>
              {sourcePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setSourcePreview(null);
                    setSourceBase64(null);
                    setSourceMime(null);
                  }}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>
            {sourcePreview && (
              <img
                src={sourcePreview}
                alt="Reference preview"
                className="mt-3 h-28 w-40 object-cover border border-[#12284A]/10"
              />
            )}
          </div>

          <div>
            <label htmlFor="studio-prompt" className="block text-xs font-medium text-[#12284A] mb-1.5">
              Prompt
            </label>
            <textarea
              id="studio-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Stage this living room with walnut dining furniture and warm daylight, or render a 10 marla brick home elevation at dusk..."
              className="w-full px-3.5 py-2.5 border border-[#12284A]/20 text-sm text-[#12284A]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="studio-ratio" className="text-xs font-medium text-[#12284A]">
                Aspect ratio:
              </label>
              <select
                id="studio-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as '4:3' | '16:9' | '1:1' | '3:4')}
                className="px-3 py-1.5 border border-[#12284A]/20 text-xs text-[#12284A] bg-white"
              >
                <option value="4:3">4:3 (Listing card)</option>
                <option value="16:9">16:9 (Wide banner)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="3:4">3:4 (Portrait)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9B27C]" aria-hidden="true" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
              )}
              <span>{generating ? 'Generating...' : 'Generate image'}</span>
            </button>
          </div>
        </div>

        {generatedDataUrl && (
          <div className="pt-4 border-t border-[#12284A]/10 space-y-4">
            <img
              src={generatedDataUrl}
              alt="Generated property visual"
              className="w-full max-h-72 object-contain bg-[#F5F6F8] border border-[#12284A]/10"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToCatalog}
                disabled={saving}
                className="px-5 py-2 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-60"
              >
                {saving ? 'Saving image...' : 'Use this image'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
