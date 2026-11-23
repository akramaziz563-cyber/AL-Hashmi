import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { siteSettingsSchema } from '../../lib/validation';
import { StaffRole } from '../../types';

export function AdminSettingsTab() {
  const {
    siteSettings,
    staffProfiles,
    isAdmin,
    saveSiteSettings,
    upsertStaffProfile,
    deleteStaffProfile,
  } = useAgency();

  const [form, setForm] = useState({
    agencyName: siteSettings.agencyName,
    phone: siteSettings.phone,
    whatsappNumber: siteSettings.whatsappNumber,
    address: siteSettings.address,
    email: siteSettings.email || '',
    workingHours: siteSettings.workingHours || '',
    facebookUrl: siteSettings.facebookUrl || '',
    instagramUrl: siteSettings.instagramUrl || '',
    googleMapsUrl: siteSettings.googleMapsUrl,
    googleRating: siteSettings.googleRating,
    reviewCount: siteSettings.reviewCount,
    heroHeadline: siteSettings.heroHeadline,
    heroSubheadline: siteSettings.heroSubheadline,
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Staff role form
  const [staffUid, setStaffUid] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('editor');

  useEffect(() => {
    setForm({
      agencyName: siteSettings.agencyName,
      phone: siteSettings.phone,
      whatsappNumber: siteSettings.whatsappNumber,
      address: siteSettings.address,
      email: siteSettings.email || '',
      workingHours: siteSettings.workingHours || '',
      facebookUrl: siteSettings.facebookUrl || '',
      instagramUrl: siteSettings.instagramUrl || '',
      googleMapsUrl: siteSettings.googleMapsUrl,
      googleRating: siteSettings.googleRating,
      reviewCount: siteSettings.reviewCount,
      heroHeadline: siteSettings.heroHeadline,
      heroSubheadline: siteSettings.heroSubheadline,
    });
  }, [siteSettings]);

  if (!isAdmin) {
    return (
      <div className="bg-white border border-[#12284A]/10 p-8 text-sm text-[#4A5568]">
        Site settings and staff roles can only be modified by an account with the Administrator role.
      </div>
    );
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);

    const parsed = siteSettingsSchema.safeParse({
      ...form,
      googleRating: Number(form.googleRating),
      reviewCount: Math.round(Number(form.reviewCount)),
    });

    if (!parsed.success) {
      const firstErr = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(firstErr || 'Please check settings fields.');
      return;
    }

    setSaving(true);
    try {
      await saveSiteSettings(parsed.data);
      setSavedMsg('Site settings updated across the public website.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUid.trim() || !staffEmail.trim() || !staffName.trim()) return;
    await upsertStaffProfile(staffUid.trim(), staffEmail.trim(), staffName.trim(), staffRole);
    setStaffUid('');
    setStaffEmail('');
    setStaffName('');
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSaveSettings} className="bg-white border border-[#12284A]/10 p-6 space-y-5">
        <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
          Agency &amp; Website Settings
        </h2>

        {error && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}
        {savedMsg && (
          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {savedMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#12284A] mb-1">Agency name</label>
            <input
              type="text"
              required
              value={form.agencyName}
              onChange={(e) => setForm((p) => ({ ...p, agencyName: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Phone number</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">
              WhatsApp number (e.g. 923008620646)
            </label>
            <input
              type="text"
              required
              value={form.whatsappNumber}
              onChange={(e) => setForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#12284A] mb-1">Office address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Working hours</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm((p) => ({ ...p, workingHours: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Google Maps URL</label>
            <input
              type="url"
              required
              value={form.googleMapsUrl}
              onChange={(e) => setForm((p) => ({ ...p, googleMapsUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#12284A] mb-1">
                Google rating
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={5}
                value={form.googleRating}
                onChange={(e) =>
                  setForm((p) => ({ ...p, googleRating: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-[#12284A]/20 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#12284A] mb-1">
                Review count
              </label>
              <input
                type="number"
                min={0}
                value={form.reviewCount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reviewCount: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-[#12284A]/20 text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Facebook URL</label>
            <input
              type="text"
              value={form.facebookUrl}
              onChange={(e) => setForm((p) => ({ ...p, facebookUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#12284A] mb-1">Instagram URL</label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => setForm((p) => ({ ...p, instagramUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#12284A] mb-1">Hero headline</label>
            <input
              type="text"
              required
              value={form.heroHeadline}
              onChange={(e) => setForm((p) => ({ ...p, heroHeadline: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#12284A] mb-1">
              Hero supporting line
            </label>
            <textarea
              rows={2}
              required
              value={form.heroSubheadline}
              onChange={(e) => setForm((p) => ({ ...p, heroSubheadline: e.target.value }))}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-60"
        >
          {saving ? 'Saving settings...' : 'Save site settings'}
        </button>
      </form>

      {/* Staff Role Management */}
      <div className="bg-white border border-[#12284A]/10 p-6 space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            Staff Access Roles
          </h2>
          <p className="text-xs text-[#4A5568] mt-1">
            Assign admin (full access) or editor (properties &amp; gallery) permissions by Firebase user UID.
          </p>
        </div>

        <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            value={staffUid}
            onChange={(e) => setStaffUid(e.target.value)}
            placeholder="Firebase UID"
            className="px-3 py-2 border border-[#12284A]/20 text-xs font-mono"
          />
          <input
            type="email"
            required
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="Staff email"
            className="px-3 py-2 border border-[#12284A]/20 text-xs"
          />
          <input
            type="text"
            required
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="Display name"
            className="px-3 py-2 border border-[#12284A]/20 text-xs"
          />
          <div className="flex gap-2">
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as StaffRole)}
              className="flex-1 px-2.5 py-2 border border-[#12284A]/20 text-xs bg-white"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[#12284A] text-white text-xs font-medium"
            >
              Save
            </button>
          </div>
        </form>

        {staffProfiles.length > 0 && (
          <div className="divide-y divide-[#12284A]/10 border-t border-[#12284A]/10">
            {staffProfiles.map((prof) => (
              <div key={prof.uid} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#12284A]">{prof.displayName}</span>{' '}
                  <span className="text-[#4A5568]">({prof.email})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="uppercase tracking-wide font-mono text-[#12284A]">
                    {prof.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => void deleteStaffProfile(prof.uid)}
                    aria-label={`Remove ${prof.email}`}
                    className="p-1 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
