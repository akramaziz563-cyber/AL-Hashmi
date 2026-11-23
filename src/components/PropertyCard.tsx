import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle } from 'lucide-react';
import { Property } from '../types';
import {
  buildWhatsAppUrl,
  formatArea,
  formatPkr,
  formatStatusLabel,
  formatTypeLabel,
} from '../lib/formatters';
import { useAgency } from '../context/AgencyContext';

interface PropertyCardProps {
  property: Property;
  onInquire?: (property: Property) => void;
}

export function PropertyCard({ property, onInquire }: PropertyCardProps) {
  const { siteSettings } = useAgency();
  const [imgError, setImgError] = useState(false);

  const statusTone =
    property.status === 'sold' || property.status === 'rented'
      ? 'bg-[#12284A]/85 text-white'
      : 'bg-white/95 text-[#12284A]';

  const whatsappHref = buildWhatsAppUrl(
    siteSettings.whatsappNumber,
    `Assalam-o-Alaikum, I am interested in ${property.title} (${formatPkr(
      property.pricePkr,
      property.purpose
    )}). Link: ${window.location.origin}/properties/${property.slug}`
  );

  return (
    <article className="bg-white border border-[#12284A]/10 flex flex-col justify-between transition-colors hover:border-[#12284A]/25">
      <div>
        <Link
          to={`/properties/${property.slug}`}
          className="block relative aspect-[4/3] bg-[#E8ECF2] overflow-hidden group"
        >
          {!imgError && property.coverImageUrl ? (
            <img
              src={property.coverImageUrl}
              alt={property.images[0]?.alt || property.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#EEF1F5] to-[#DFE5EE] text-[#12284A]/60">
              <Building2 className="w-8 h-8 mb-2 text-[#C9B27C]" aria-hidden="true" />
              <span className="text-xs font-medium">{property.areaName}</span>
            </div>
          )}

          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-medium tracking-wide ${statusTone}`}
          >
            {formatStatusLabel(property.status)}
          </span>
        </Link>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-base font-medium text-[#12284A] tabular-nums">
              {formatPkr(property.pricePkr, property.purpose)}
            </span>
            <span className="text-xs text-[#4A5568]">{formatTypeLabel(property.type)}</span>
          </div>

          <h3 className="font-serif text-xl font-semibold text-[#12284A] leading-snug line-clamp-2">
            <Link to={`/properties/${property.slug}`} className="hover:underline underline-offset-4">
              {property.title}
            </Link>
          </h3>

          <p className="text-sm text-[#4A5568] truncate">{property.areaName}</p>

          <div className="pt-2 border-t border-[#12284A]/8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#4A5568] tabular-nums">
            <span>{formatArea(property.areaValue, property.areaUnit)}</span>
            {property.bedrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{property.bedrooms} Bed</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{property.bathrooms} Bath</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1 flex items-center gap-2">
        {onInquire ? (
          <button
            type="button"
            onClick={() => onInquire(property)}
            className="flex-1 px-4 py-2.5 bg-[#12284A] text-white text-xs sm:text-sm font-medium hover:bg-[#0D1E38] transition-colors whitespace-nowrap"
          >
            Inquire about this property
          </button>
        ) : (
          <Link
            to={`/properties/${property.slug}#inquire`}
            className="flex-1 text-center px-4 py-2.5 bg-[#12284A] text-white text-xs sm:text-sm font-medium hover:bg-[#0D1E38] transition-colors whitespace-nowrap"
          >
            Inquire about this property
          </Link>
        )}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Inquire on WhatsApp about ${property.title}`}
          className="px-3 py-2.5 border border-[#12284A]/20 text-[#12284A] hover:border-[#12284A] hover:bg-[#F5F6F8] transition-colors inline-flex items-center justify-center shrink-0"
          title="Message on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-[#12284A]" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
