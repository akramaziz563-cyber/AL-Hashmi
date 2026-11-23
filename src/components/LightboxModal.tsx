import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface LightboxItem {
  url: string;
  caption: string;
  propertySlug?: string | null;
  propertyTitle?: string | null;
}

interface LightboxModalProps {
  items: LightboxItem[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function LightboxModal({
  items,
  activeIndex,
  onClose,
  onChangeIndex,
}: LightboxModalProps) {
  const touchStartX = useRef<number | null>(null);
  const current = items[activeIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChangeIndex((activeIndex + 1) % items.length);
      if (e.key === 'ArrowLeft') onChangeIndex((activeIndex - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, items.length, onChangeIndex, onClose]);

  if (!current) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (delta > 50) {
      onChangeIndex((activeIndex - 1 + items.length) % items.length);
    } else if (delta < -50) {
      onChangeIndex((activeIndex + 1) % items.length);
    }
    touchStartX.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-50 bg-[#0D1E38]/95 flex flex-col justify-between p-4 sm:p-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between text-white">
        <span className="font-mono text-xs tabular-nums text-white/75">
          {activeIndex + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image lightbox"
          className="p-2 text-white hover:text-[#C9B27C] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center my-4 min-h-0">
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex - 1 + items.length) % items.length)}
            aria-label="Previous image"
            className="absolute left-0 sm:left-2 z-10 p-2.5 bg-[#12284A]/80 text-white hover:text-[#C9B27C] border border-white/15"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.caption}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain select-none"
        />

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onChangeIndex((activeIndex + 1) % items.length)}
            aria-label="Next image"
            className="absolute right-0 sm:right-2 z-10 p-2.5 bg-[#12284A]/80 text-white hover:text-[#C9B27C] border border-white/15"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto w-full text-center space-y-2">
        <p className="text-sm text-white/90">{current.caption}</p>
        {current.propertySlug && (
          <Link
            to={`/properties/${current.propertySlug}`}
            onClick={onClose}
            className="inline-block text-xs font-medium text-[#C9B27C] hover:underline"
          >
            View property: {current.propertyTitle || 'Details'}
          </Link>
        )}
      </div>
    </div>
  );
}
