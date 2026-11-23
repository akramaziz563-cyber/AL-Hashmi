import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { GalleryCategory } from '../types';
import { LightboxModal } from '../components/LightboxModal';

const CATEGORIES: Array<'All' | GalleryCategory> = ['All', 'Houses', 'Plots', 'Commercial', 'Projects'];

export function GalleryPage() {
  const { galleryImages, siteSettings } = useAgency();
  const [category, setCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    document.title = `Photo Gallery — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  const filtered = useMemo(
    () =>
      category === 'All'
        ? galleryImages
        : galleryImages.filter((item) => item.category === category),
    [galleryImages, category]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="pb-8 border-b border-[#12284A]/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
            Gallery
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#4A5568] max-w-[60ch]">
            Architectural views, plot corridors, commercial elevations, and interior finishes from our portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white border border-[#12284A]/10 p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-[#12284A] text-white'
                  : 'text-[#4A5568] hover:text-[#12284A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 bg-white border border-[#12284A]/10 p-12 text-center text-sm text-[#4A5568]">
          No gallery photographs found in the {category} category yet.
        </div>
      ) : (
        <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filtered.map((item, idx) => (
            <figure
              key={item.id}
              className="break-inside-avoid bg-white border border-[#12284A]/10 overflow-hidden group"
            >
              <button
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="block w-full text-left overflow-hidden focus:outline-none"
                aria-label={`Open ${item.caption} in lightbox`}
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </button>
              <figcaption className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-[#4A5568]">
                  <span>{item.category}</span>
                  {item.propertySlug && (
                    <Link
                      to={`/properties/${item.propertySlug}`}
                      className="inline-flex items-center gap-1 font-medium text-[#12284A] hover:underline"
                    >
                      <span>View listing</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <p className="text-sm text-[#12284A] leading-snug">{item.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <LightboxModal
          items={filtered.map((item) => ({
            url: item.url,
            caption: item.caption,
            propertySlug: item.propertySlug,
            propertyTitle: item.propertyTitle,
          }))}
          activeIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onChangeIndex={(next) => setLightboxIdx(next)}
        />
      )}
    </div>
  );
}
