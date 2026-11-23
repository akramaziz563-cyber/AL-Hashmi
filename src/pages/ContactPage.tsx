import { useEffect } from 'react';
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { InquiryForm } from '../components/InquiryForm';
import { MapsInsightsPanel } from '../components/MapsInsightsPanel';
import { buildWhatsAppUrl } from '../lib/formatters';

export function ContactPage() {
  const { siteSettings } = useAgency();

  useEffect(() => {
    document.title = `Contact — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  const telHref = `tel:${siteSettings.phone.replace(/\s+/g, '')}`;
  const whatsappHref = buildWhatsAppUrl(
    siteSettings.whatsappNumber,
    `Assalam-o-Alaikum, I would like to speak with ${siteSettings.agencyName}.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-14">
      <div className="border-b border-[#12284A]/10 pb-8 space-y-3">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
          Contact our office
        </h1>
        <p className="text-base text-[#4A5568] max-w-[60ch]">
          Reach us by phone, WhatsApp, or in person at our Ferozewala / Sahiwal office, or send a general inquiry using the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#12284A]/10 p-6 space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
              Direct contact details
            </h2>

            <div className="space-y-4 text-sm text-[#4A5568]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#12284A]">Office address</p>
                  <p className="mt-0.5 leading-relaxed">{siteSettings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#12284A]">Phone &amp; WhatsApp</p>
                  <a href={telHref} className="block mt-0.5 tabular-nums hover:text-[#12284A]">
                    {siteSettings.phone} (+92 300 8620646)
                  </a>
                </div>
              </div>

              {siteSettings.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#12284A]">Email</p>
                    <a href={`mailto:${siteSettings.email}`} className="block mt-0.5 hover:text-[#12284A]">
                      {siteSettings.email}
                    </a>
                  </div>
                </div>
              )}

              {siteSettings.workingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-[#12284A]">Working hours</p>
                    <p className="mt-0.5">{siteSettings.workingHours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38]"
              >
                <MessageCircle className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={siteSettings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#12284A]/20 text-[#12284A] text-xs font-medium hover:border-[#12284A]"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#12284A]/10 p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold text-[#12284A] mb-5">
            Send a general inquiry
          </h2>
          <InquiryForm sourcePage="/contact" submitLabel="Send general inquiry" />
        </div>
      </div>

      <MapsInsightsPanel
        locationQuery={siteSettings.address}
        lat={31.6915}
        lng={74.294}
        fallbackMapsUrl={siteSettings.googleMapsUrl}
      />
    </div>
  );
}
