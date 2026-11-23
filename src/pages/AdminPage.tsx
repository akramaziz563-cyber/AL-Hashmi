import { useEffect, useMemo, useState } from 'react';
import { Database, LogOut, ShieldCheck } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { AdminPropertiesTab } from '../components/admin/AdminPropertiesTab';
import { AdminGalleryTab } from '../components/admin/AdminGalleryTab';
import { AdminInquiriesTab } from '../components/admin/AdminInquiriesTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

type AdminTab = 'dashboard' | 'properties' | 'gallery' | 'inquiries' | 'settings';

export function AdminPage() {
  const {
    user,
    authReady,
    isStaff,
    isAdmin,
    staffRole,
    properties,
    inquiries,
    siteSettings,
    usingFallbackData,
    signInWithGoogle,
    signOutUser,
    seedSamplePortfolio,
  } = useAgency();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [seeding, setSeeding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Admin Panel — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  const stats = useMemo(() => {
    const total = properties.length;
    const available = properties.filter(
      (p) => p.status === 'for_sale' || p.status === 'for_rent'
    ).length;
    const closed = properties.filter((p) => p.status === 'sold' || p.status === 'rented').length;
    const newInquiries = inquiries.filter((i) => i.status === 'new').length;
    const monthPrefix = new Date().toISOString().slice(0, 7);
    const thisMonth = inquiries.filter((i) => i.createdAt.startsWith(monthPrefix)).length;
    return { total, available, closed, newInquiries, thisMonth };
  }, [properties, inquiries]);

  if (!authReady) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-sm text-[#4A5568]">
        Verifying session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white border border-[#12284A]/15 p-8 space-y-5">
          <div className="flex items-center gap-2.5 text-[#12284A]">
            <ShieldCheck className="w-5 h-5 text-[#C9B27C]" aria-hidden="true" />
            <h1 className="font-serif text-3xl font-semibold">Staff Admin Sign-In</h1>
          </div>
          <p className="text-sm text-[#4A5568] leading-relaxed">
            Sign in with your authorized Google account to manage listings, gallery images, client inquiries, and agency settings.
          </p>
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800">
              {authError}
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              setAuthError(null);
              try {
                await signInWithGoogle();
              } catch (err) {
                setAuthError(
                  err instanceof Error ? err.message : 'Unable to complete Google sign-in.'
                );
              }
            }}
            className="w-full px-5 py-3 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38] transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-white border border-[#12284A]/15 p-8 space-y-4">
          <h1 className="font-serif text-2xl font-semibold text-[#12284A]">
            Access restricted
          </h1>
          <p className="text-sm text-[#4A5568]">
            Signed in as <span className="font-medium text-[#12284A]">{user.email}</span>, which does not have admin or editor permissions for {siteSettings.agencyName}.
          </p>
          <p className="text-xs text-[#4A5568] font-mono">UID: {user.uid}</p>
          <button
            type="button"
            onClick={() => void signOutUser()}
            className="px-4 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; visible: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', visible: true },
    { id: 'properties', label: 'Properties', visible: true },
    { id: 'gallery', label: 'Gallery', visible: true },
    { id: 'inquiries', label: 'Inquiries', visible: isAdmin },
    { id: 'settings', label: 'Site settings', visible: isAdmin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#12284A]/10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12284A]">
            Agency Admin Panel
          </h1>
          <p className="text-xs text-[#4A5568] mt-1">
            Signed in as {user.email} · Role: <span className="capitalize font-medium text-[#12284A]">{staffRole}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void signOutUser()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A] hover:border-[#12284A] self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#12284A]/10">
        {tabs
          .filter((t) => t.visible)
          .map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#12284A] text-[#12284A] bg-white'
                  : 'border-transparent text-[#4A5568] hover:text-[#12284A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {usingFallbackData && (
            <div className="bg-white border border-[#C9B27C] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-semibold text-[#12284A]">
                  Initialize live Firestore database
                </h2>
                <p className="text-xs text-[#4A5568]">
                  Your Firestore catalog is currently empty. Seed the 6 sample properties, gallery items, and agency settings so you can edit or replace them live.
                </p>
              </div>
              <button
                type="button"
                disabled={seeding}
                onClick={async () => {
                  setSeeding(true);
                  try {
                    await seedSamplePortfolio();
                  } finally {
                    setSeeding(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Database className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
                <span>{seeding ? 'Seeding database...' : 'Seed 6 sample properties'}</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-[#12284A]/10 p-5">
              <p className="text-xs text-[#4A5568]">Total properties</p>
              <p className="font-mono text-2xl font-semibold text-[#12284A] mt-1 tabular-nums">
                {stats.total}
              </p>
            </div>
            <div className="bg-white border border-[#12284A]/10 p-5">
              <p className="text-xs text-[#4A5568]">Available</p>
              <p className="font-mono text-2xl font-semibold text-[#12284A] mt-1 tabular-nums">
                {stats.available}
              </p>
            </div>
            <div className="bg-white border border-[#12284A]/10 p-5">
              <p className="text-xs text-[#4A5568]">Sold / Rented</p>
              <p className="font-mono text-2xl font-semibold text-[#12284A] mt-1 tabular-nums">
                {stats.closed}
              </p>
            </div>
            <div className="bg-white border border-[#12284A]/10 p-5">
              <p className="text-xs text-[#4A5568]">New inquiries</p>
              <p className="font-mono text-2xl font-semibold text-[#12284A] mt-1 tabular-nums">
                {stats.newInquiries}
              </p>
            </div>
            <div className="bg-white border border-[#12284A]/10 p-5">
              <p className="text-xs text-[#4A5568]">Inquiries this month</p>
              <p className="font-mono text-2xl font-semibold text-[#12284A] mt-1 tabular-nums">
                {stats.thisMonth}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#12284A]/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
                Recent inquiries
              </h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="text-xs font-medium text-[#12284A] hover:underline"
                >
                  View all inquiries
                </button>
              )}
            </div>

            {inquiries.length === 0 ? (
              <p className="text-xs text-[#4A5568]">No inquiries received yet.</p>
            ) : (
              <div className="divide-y divide-[#12284A]/10">
                {inquiries.slice(0, 5).map((inq) => (
                  <div key={inq.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-medium text-[#12284A]">
                        {inq.name} · <span className="tabular-nums">{inq.phone}</span>
                      </p>
                      <p className="text-[#4A5568] mt-0.5">
                        {inq.propertyTitle || 'General inquiry'} — {inq.message.slice(0, 90)}
                      </p>
                    </div>
                    <span className="capitalize font-medium text-[#12284A] shrink-0">
                      {inq.status} · {inq.createdAt.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'properties' && <AdminPropertiesTab />}
      {activeTab === 'gallery' && <AdminGalleryTab />}
      {activeTab === 'inquiries' && isAdmin && <AdminInquiriesTab />}
      {activeTab === 'settings' && isAdmin && <AdminSettingsTab />}
    </div>
  );
}
