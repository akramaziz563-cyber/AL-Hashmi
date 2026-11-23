import { useState } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { inquiryFormSchema } from '../lib/validation';
import { useAgency } from '../context/AgencyContext';
import { buildWhatsAppUrl } from '../lib/formatters';

interface InquiryFormProps {
  propertyId?: string | null;
  propertyTitle?: string | null;
  sourcePage: string;
  submitLabel?: string;
  onSuccess?: () => void;
}

export function InquiryForm({
  propertyId = null,
  propertyTitle = null,
  sourcePage,
  submitLabel = 'Send inquiry',
  onSuccess,
}: InquiryFormProps) {
  const { submitInquiry, siteSettings } = useAgency();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    propertyTitle
      ? `I would like more details and a viewing schedule for "${propertyTitle}".`
      : ''
  );
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = inquiryFormSchema.safeParse({
      name,
      phone,
      email,
      message,
      website,
    });

    if (!parsed.success) {
      const firstErr = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(firstErr || 'Please check the form fields and try again.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || '',
        message: parsed.data.message,
        propertyId,
        propertyTitle,
        sourcePage,
        website: parsed.data.website,
      });
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send your inquiry right now. Please call 0300 8620646.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#F5F6F8] border border-[#12284A]/15 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-[#12284A]">
          <CheckCircle2 className="w-5 h-5 text-[#C9B27C]" aria-hidden="true" />
          <h3 className="font-serif text-xl font-semibold">Inquiry received</h3>
        </div>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          Thank you for reaching out to {siteSettings.agencyName}. A representative will contact you
          shortly on the number you provided.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A] hover:border-[#12284A]"
          >
            Send another inquiry
          </button>
          <a
            href={buildWhatsAppUrl(
              siteSettings.whatsappNumber,
              propertyTitle
                ? `Assalam-o-Alaikum, I just submitted an inquiry for ${propertyTitle}.`
                : 'Assalam-o-Alaikum, I just submitted a property inquiry on your website.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38]"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
            <span>Continue on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Hidden honeypot field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`website-${sourcePage}`}>Leave this empty</label>
        <input
          id={`website-${sourcePage}`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {propertyTitle && (
        <div className="px-3.5 py-2.5 bg-[#F5F6F8] border border-[#12284A]/10 text-xs text-[#4A5568]">
          Regarding: <span className="font-medium text-[#12284A]">{propertyTitle}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-800"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`inq-name-${sourcePage}`} className="block text-xs font-medium text-[#12284A] mb-1.5">
            Full name <span className="text-red-700">*</span>
          </label>
          <input
            id={`inq-name-${sourcePage}`}
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 bg-white border border-[#12284A]/20 text-sm text-[#12284A] focus:border-[#12284A]"
          />
        </div>

        <div>
          <label htmlFor={`inq-phone-${sourcePage}`} className="block text-xs font-medium text-[#12284A] mb-1.5">
            Phone or WhatsApp <span className="text-red-700">*</span>
          </label>
          <input
            id={`inq-phone-${sourcePage}`}
            type="tel"
            required
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300 0000000"
            className="w-full px-3.5 py-2.5 bg-white border border-[#12284A]/20 text-sm text-[#12284A] focus:border-[#12284A]"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`inq-email-${sourcePage}`} className="block text-xs font-medium text-[#12284A] mb-1.5">
          Email address (optional)
        </label>
        <input
          id={`inq-email-${sourcePage}`}
          type="email"
          maxLength={160}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 bg-white border border-[#12284A]/20 text-sm text-[#12284A] focus:border-[#12284A]"
        />
      </div>

      <div>
        <label htmlFor={`inq-msg-${sourcePage}`} className="block text-xs font-medium text-[#12284A] mb-1.5">
          Message <span className="text-red-700">*</span>
        </label>
        <textarea
          id={`inq-msg-${sourcePage}`}
          required
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us your preferred viewing time, budget, or questions..."
          className="w-full px-3.5 py-2.5 bg-white border border-[#12284A]/20 text-sm text-[#12284A] focus:border-[#12284A]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-3 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38] disabled:opacity-60 transition-colors"
      >
        {submitting ? 'Sending inquiry...' : submitLabel}
      </button>
    </form>
  );
}
