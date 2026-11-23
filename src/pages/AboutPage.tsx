import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';

export function AboutPage() {
  const { siteSettings } = useAgency();

  useEffect(() => {
    document.title = `About — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-14">
      <div className="space-y-4 border-b border-[#12284A]/10 pb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
          About {siteSettings.agencyName}
        </h1>
        <p className="text-base sm:text-lg text-[#4A5568] max-w-[65ch] leading-relaxed">
          We are a local real estate advisory dedicated to honest property representation, clear ownership verification, and attentive guidance for buyers, sellers, and tenants across Sahiwal and Ferozewala.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-7 space-y-5 text-base text-[#4A5568] leading-relaxed">
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            Our approach to property representation
          </h2>
          <p>
            Buying or selling a home, commercial building, or parcel of land is one of the most consequential financial decisions a family or business makes. We treat every mandate with patience, discretion, and thorough preparation.
          </p>
          <p>
            Instead of inflating expectations or rushing token commitments, we focus on realistic market valuation, direct communication between parties, and confirming title documentation—including registry, intiqal, and fard records—prior to closing.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/properties"
              className="px-6 py-3 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38]"
            >
              Browse properties
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-[#12284A]/20 text-[#12284A] text-sm font-medium hover:border-[#12284A]"
            >
              Contact our office
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 bg-white border border-[#12284A]/10 p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#12284A]">
            <Star className="w-4 h-4 fill-[#C9B27C] text-[#C9B27C]" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">
              {siteSettings.googleRating.toFixed(1)} Google rating · {siteSettings.reviewCount} reviews
            </span>
          </div>

          <div className="space-y-2 text-sm text-[#4A5568]">
            <p className="font-medium text-[#12284A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
              <span>Office location</span>
            </p>
            <p className="leading-relaxed">{siteSettings.address}</p>
            <a
              href={siteSettings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium text-[#12284A] underline underline-offset-4"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="space-y-1 text-sm text-[#4A5568] pt-3 border-t border-[#12284A]/10">
            <p className="font-medium text-[#12284A] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
              <span>Direct phone</span>
            </p>
            <a
              href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
              className="tabular-nums hover:text-[#12284A]"
            >
              {siteSettings.phone} (+92 300 8620646)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
