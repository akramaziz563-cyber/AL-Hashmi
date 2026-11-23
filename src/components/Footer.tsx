import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, ExternalLink } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { buildWhatsAppUrl } from '../lib/formatters';

export function Footer() {
  const { siteSettings } = useAgency();
  const whatsappHref = buildWhatsAppUrl(
    siteSettings.whatsappNumber,
    `Assalam-o-Alaikum, I would like to inquire about properties listed with ${siteSettings.agencyName}.`
  );

  return (
    <footer className="bg-[#12284A] text-[#F5F6F8] border-t border-[#C9B27C]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="font-serif text-2xl font-semibold text-white inline-block">
              {siteSettings.agencyName}
            </Link>
            <p className="text-sm text-[#F5F6F8]/75 max-w-md leading-relaxed">
              Dedicated residential, plot, and commercial real estate advisory serving families and
              investors with transparent documentation and local guidance.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-[#C9B27C] pt-1">
              <Star className="w-4 h-4 fill-[#C9B27C]" aria-hidden="true" />
              <span className="tabular-nums font-medium">
                {siteSettings.googleRating.toFixed(1)} Google rating ({siteSettings.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="font-sans text-sm font-semibold text-white">Navigation</h2>
            <ul className="space-y-2 text-sm text-[#F5F6F8]/75">
              <li>
                <Link to="/properties" className="hover:text-[#C9B27C] transition-colors">
                  Browse properties
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#C9B27C] transition-colors">
                  Photo gallery
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#C9B27C] transition-colors">
                  Our services
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C9B27C] transition-colors">
                  About the firm
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C9B27C] transition-colors">
                  Contact office
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#C9B27C] transition-colors">
                  Staff admin portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-sm text-[#F5F6F8]/80">
            <h2 className="font-sans text-sm font-semibold text-white">Office & Contact</h2>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C9B27C] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">{siteSettings.address}</p>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#C9B27C] shrink-0" aria-hidden="true" />
              <a
                href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
                className="hover:text-[#C9B27C] transition-colors tabular-nums"
              >
                {siteSettings.phone} (+92 300 8620646)
              </a>
            </div>
            {siteSettings.workingHours && (
              <p className="text-xs text-[#F5F6F8]/65">{siteSettings.workingHours}</p>
            )}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9B27C] hover:underline inline-flex items-center gap-1"
              >
                <span>Message on WhatsApp</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
              <a
                href={siteSettings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-[#C9B27C] inline-flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F6F8]/60">
          <p>
            &copy; {new Date().getFullYear()} {siteSettings.agencyName}. All rights reserved.
          </p>
          <p>Sahiwal &amp; Ferozewala, Punjab, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
