import { useMemo, useState } from 'react';
import { Download, MessageCircle, Phone, Trash2, X } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { buildWhatsAppUrl, exportInquiriesToCsv } from '../../lib/formatters';
import { Inquiry, InquiryStatus } from '../../types';

export function AdminInquiriesTab() {
  const { inquiries, properties, siteSettings, updateInquiry, deleteInquiry } = useAgency();
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);
  const [editStatus, setEditStatus] = useState<InquiryStatus>('new');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false;
      if (propertyFilter !== 'all') {
        if (propertyFilter === 'general' && inq.propertyId) return false;
        if (propertyFilter !== 'general' && inq.propertyId !== propertyFilter) return false;
      }
      if (dateFrom && inq.createdAt.slice(0, 10) < dateFrom) return false;
      return true;
    });
  }, [inquiries, statusFilter, propertyFilter, dateFrom]);

  const openInquiry = (inq: Inquiry) => {
    setActiveInquiry(inq);
    setEditStatus(inq.status);
    setEditNotes(inq.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!activeInquiry) return;
    setSaving(true);
    try {
      await updateInquiry(activeInquiry.id, editStatus, editNotes);
      setActiveInquiry(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
          Inquiries ({filtered.length})
        </h2>
        <button
          type="button"
          onClick={() => exportInquiriesToCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A] hover:border-[#12284A] disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white border border-[#12284A]/10 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | InquiryStatus)}
          className="px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
        >
          <option value="all">All properties &amp; general</option>
          <option value="general">General inquiries only</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Filter inquiries from date"
          className="px-3 py-2 border border-[#12284A]/20 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#12284A]/10 p-10 text-center text-sm text-[#4A5568]">
          No inquiries match the selected filters.
        </div>
      ) : (
        <div className="bg-white border border-[#12284A]/10 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#12284A]/10 bg-[#F5F6F8] text-[#4A5568]">
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Subject</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12284A]/10">
              {filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#F5F6F8]/60">
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#12284A]">{inq.name}</p>
                    <p className="text-[#4A5568] tabular-nums">{inq.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#12284A] truncate max-w-xs">
                      {inq.propertyTitle || 'General inquiry'}
                    </p>
                    <p className="text-[#4A5568] truncate max-w-xs">{inq.message}</p>
                  </td>
                  <td className="py-3 px-4 capitalize text-[#12284A] font-medium">
                    {inq.status}
                  </td>
                  <td className="py-3 px-4 tabular-nums text-[#4A5568]">
                    {inq.createdAt.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openInquiry(inq)}
                        className="px-2.5 py-1 border border-[#12284A]/20 text-[#12284A] font-medium hover:border-[#12284A]"
                      >
                        Details
                      </button>
                      <a
                        href={`tel:${inq.phone.replace(/\s+/g, '')}`}
                        title="Call client"
                        className="p-1.5 border border-[#12284A]/15 text-[#12284A]"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={buildWhatsAppUrl(
                          inq.phone,
                          `Assalam-o-Alaikum ${inq.name}, thank you for contacting ${siteSettings.agencyName} regarding ${
                            inq.propertyTitle || 'your inquiry'
                          }.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Reply on WhatsApp"
                        className="p-1.5 border border-[#12284A]/15 text-[#12284A]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => void deleteInquiry(inq.id)}
                        title="Delete inquiry"
                        className="p-1.5 border border-red-200 text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeInquiry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0D1E38]/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#12284A]/15 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-[#12284A]/10 pb-3">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#12284A]">
                  {activeInquiry.name}
                </h3>
                <p className="text-xs text-[#4A5568] tabular-nums mt-0.5">
                  {activeInquiry.phone} {activeInquiry.email ? `· ${activeInquiry.email}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                aria-label="Close inquiry details"
                className="p-1 text-[#4A5568]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[#4A5568]">
                <span className="font-medium text-[#12284A]">Subject:</span>{' '}
                {activeInquiry.propertyTitle || 'General inquiry'} ({activeInquiry.sourcePage})
              </p>
              <div className="p-3.5 bg-[#F5F6F8] border border-[#12284A]/10 text-sm text-[#12284A] whitespace-pre-line">
                {activeInquiry.message}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#12284A] mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                  className="w-full px-3 py-2 border border-[#12284A]/20 text-xs bg-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#12284A] mb-1">
                  Private staff notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal follow-up log..."
                  className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#12284A]/10">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeInquiry.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
                  <span>Call</span>
                </a>
                <a
                  href={buildWhatsAppUrl(
                    activeInquiry.phone,
                    `Assalam-o-Alaikum ${activeInquiry.name}, regarding your inquiry with ${siteSettings.agencyName}...`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
                  <span>WhatsApp reply</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                className="px-5 py-2 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save updates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
