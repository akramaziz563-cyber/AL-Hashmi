import { X } from 'lucide-react';
import { Property } from '../types';
import { InquiryForm } from './InquiryForm';
import { formatPkr } from '../lib/formatters';

interface PropertyQuickInquiryModalProps {
  property: Property | null;
  sourcePage: string;
  onClose: () => void;
}

export function PropertyQuickInquiryModal({
  property,
  sourcePage,
  onClose,
}: PropertyQuickInquiryModalProps) {
  if (!property) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Inquire about ${property.title}`}
      className="fixed inset-0 z-50 bg-[#0D1E38]/75 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-[#12284A]/15 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#12284A]/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
              Inquire about this property
            </h2>
            <p className="text-xs text-[#4A5568] mt-1">
              {property.title} · {formatPkr(property.pricePkr, property.purpose)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close inquiry modal"
            className="p-1.5 text-[#4A5568] hover:text-[#12284A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <InquiryForm
          propertyId={property.id}
          propertyTitle={property.title}
          sourcePage={sourcePage}
          submitLabel="Inquire about this property"
        />
      </div>
    </div>
  );
}
