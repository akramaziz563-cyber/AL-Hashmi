import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  Maximize2,
  MessageCircle,
  Phone,
  Share2,
} from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import {
  buildWhatsAppUrl,
  formatArea,
  formatFurnishedLabel,
  formatPkr,
  formatStatusLabel,
  formatTypeLabel,
} from '../lib/formatters';
import { LightboxModal } from '../components/LightboxModal';
import { InquiryForm } from '../components/InquiryForm';
import { MapsInsightsPanel } from '../components/MapsInsightsPanel';
import { PropertyCard } from '../components/PropertyCard';

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { properties, siteSettings } = useAgency();

  const property = useMemo(
    () => properties.find((p) => p.slug === slug),
    [properties, slug]
  );

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setActivePhotoIndex(0);
    if (property) {
      document.title = `${property.title} — ${siteSettings.agencyName}`;
    } else {
      document.title = `Property not found — ${siteSettings.agencyName}`;
    }
  }, [property, siteSettings.agencyName]);

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-[#12284A]">
          Property not found
        </h1>
        <p className="text-sm text-[#4A5568]">
          This listing may have been removed or its URL has changed.
        </p>
        <Link
          to="/properties"
          className="inline-block px-6 py-3 bg-[#12284A] text-white text-sm font-medium"
        >
          Browse available properties
        </Link>
      </div>
    );
  }

  const images =
    property.images.length > 0
      ? property.images
      : [{ url: property.coverImageUrl, alt: property.title, isCover: true }];

  const currentImage = images[activePhotoIndex] || images[0];

  const similarProperties = properties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.purpose === property.purpose))
    .slice(0, 3);

  const shareUrl = `${window.location.origin}/properties/${property.slug}`;
  const whatsappHref = buildWhatsAppUrl(
    siteSettings.whatsappNumber,
    `Assalam-o-Alaikum, I would like to inquire about "${property.title}" (${formatPkr(
      property.pricePkr,
      property.purpose
    )}). Link: ${shareUrl}`
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `${property.title} — ${formatPkr(property.pricePkr, property.purpose)}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignore clipboard denial
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5568] hover:text-[#12284A]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to properties</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A] hover:border-[#12284A]"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
              <span>Link copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share property</span>
            </>
          )}
        </button>
      </div>

      {/* Title & Headline Bar */}
      <div className="pb-6 border-b border-[#12284A]/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#4A5568]">
            <span className="px-2.5 py-0.5 bg-[#12284A] text-white font-medium">
              {formatStatusLabel(property.status)}
            </span>
            <span>{formatTypeLabel(property.type)}</span>
            <span aria-hidden="true">·</span>
            <span>{property.areaName}</span>
            {property.isSample && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#12284A] font-medium">Sample placeholder</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#12284A]">
            {property.title}
          </h1>
          <p className="text-sm text-[#4A5568]">{property.address}</p>
        </div>

        <div className="lg:text-right shrink-0">
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-[#12284A] tabular-nums">
            {formatPkr(property.pricePkr, property.purpose)}
          </div>
          <p className="text-xs text-[#4A5568] mt-1">
            {formatArea(property.areaValue, property.areaUnit)}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 8 Cols: Gallery, Description, Specs, Amenities, Map */}
        <div className="lg:col-span-8 space-y-10">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] bg-[#E8ECF2] border border-[#12284A]/10 overflow-hidden">
              {currentImage?.url ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#4A5568]">
                  <Building2 className="w-10 h-10 mb-2 text-[#C9B27C]" aria-hidden="true" />
                  <span className="text-sm">No image available</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open full-screen photo gallery"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#12284A]/90 text-white text-xs font-medium hover:bg-[#12284A]"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
                <span>View full screen ({images.length})</span>
              </button>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {images.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`aspect-[4/3] overflow-hidden border-2 transition-colors ${
                      idx === activePhotoIndex
                        ? 'border-[#12284A]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="bg-white border border-[#12284A]/10 p-6">
            <h2 className="font-serif text-2xl font-semibold text-[#12284A] mb-4">
              Specifications
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 text-sm">
              <div>
                <dt className="text-xs text-[#4A5568]">Area size</dt>
                <dd className="font-medium text-[#12284A] mt-0.5 tabular-nums">
                  {formatArea(property.areaValue, property.areaUnit)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A5568]">Property type</dt>
                <dd className="font-medium text-[#12284A] mt-0.5">
                  {formatTypeLabel(property.type)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A5568]">Furnishing</dt>
                <dd className="font-medium text-[#12284A] mt-0.5">
                  {formatFurnishedLabel(property.furnished)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A5568]">Bedrooms</dt>
                <dd className="font-medium text-[#12284A] mt-0.5 tabular-nums">
                  {property.bedrooms > 0 ? property.bedrooms : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A5568]">Bathrooms</dt>
                <dd className="font-medium text-[#12284A] mt-0.5 tabular-nums">
                  {property.bathrooms > 0 ? property.bathrooms : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A5568]">Car parking</dt>
                <dd className="font-medium text-[#12284A] mt-0.5 tabular-nums">
                  {property.parking > 0 ? `${property.parking} vehicles` : '—'}
                </dd>
              </div>
              {property.yearBuilt && (
                <div>
                  <dt className="text-xs text-[#4A5568]">Year built</dt>
                  <dd className="font-medium text-[#12284A] mt-0.5 tabular-nums">
                    {property.yearBuilt}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-[#4A5568]">Locality</dt>
                <dd className="font-medium text-[#12284A] mt-0.5">{property.areaName}</dd>
              </div>
            </dl>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
              Property overview
            </h2>
            <p className="text-base text-[#4A5568] leading-relaxed max-w-[70ch] whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
                Features &amp; amenities
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[#4A5568]">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C9B27C] shrink-0" aria-hidden="true" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Embedded Map + Google Maps Grounding Insights */}
          <MapsInsightsPanel
            locationQuery={`${property.address}, ${property.areaName}, Pakistan`}
            lat={property.lat}
            lng={property.lng}
            fallbackMapsUrl={siteSettings.googleMapsUrl}
          />
        </div>

        {/* Right 4 Cols: Direct Inquiry & WhatsApp */}
        <aside id="inquire" className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#12284A]/15 p-6 space-y-5 sticky top-24">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
                Inquire about this property
              </h2>
              <p className="text-xs text-[#4A5568] mt-1">
                Direct response from {siteSettings.agencyName}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
                <span>Inquire on WhatsApp</span>
              </a>

              <a
                href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#12284A]/20 text-[#12284A] text-sm font-medium hover:border-[#12284A]"
              >
                <Phone className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
                <span>Call {siteSettings.phone}</span>
              </a>
            </div>

            <div className="pt-4 border-t border-[#12284A]/10">
              <InquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                sourcePage={`/properties/${property.slug}`}
                submitLabel="Inquire about this property"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#12284A]/10">
          <h2 className="font-serif text-3xl font-semibold text-[#12284A] mb-8">
            Similar properties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {similarProperties.map((sim) => (
              <PropertyCard key={sim.id} property={sim} />
            ))}
          </div>
        </section>
      )}

      {lightboxOpen && (
        <LightboxModal
          items={images.map((img) => ({
            url: img.url,
            caption: img.alt || property.title,
          }))}
          activeIndex={activePhotoIndex}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={(idx) => setActivePhotoIndex(idx)}
        />
      )}
    </div>
  );
}
