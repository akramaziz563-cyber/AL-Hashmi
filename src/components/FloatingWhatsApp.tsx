import { MessageCircle } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { buildWhatsAppUrl } from '../lib/formatters';

export function FloatingWhatsApp() {
  const { siteSettings } = useAgency();
  const href = buildWhatsAppUrl(
    siteSettings.whatsappNumber,
    `Assalam-o-Alaikum, I would like to speak with ${siteSettings.agencyName} regarding a property.`
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with Al Hashmi Real Estate Agency Sahiwal"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-3 bg-[#12284A] text-white border border-[#C9B27C]/60 shadow-lg hover:bg-[#0D1E38] transition-colors"
    >
      <MessageCircle className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
      <span className="text-sm font-medium whitespace-nowrap">WhatsApp</span>
    </a>
  );
}
