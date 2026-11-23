import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAgency } from '../context/AgencyContext';

export function NotFoundPage() {
  const { siteSettings } = useAgency();

  useEffect(() => {
    document.title = `Page not found — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
      <p className="font-mono text-sm text-[#C9B27C]">404</p>
      <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
        Page not found
      </h1>
      <p className="text-sm sm:text-base text-[#4A5568]">
        The page you requested could not be found. You can return to the home page or browse current properties.
      </p>
      <div className="pt-2 flex justify-center gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38]"
        >
          Back to home
        </Link>
        <Link
          to="/properties"
          className="px-6 py-3 border border-[#12284A]/20 text-[#12284A] text-sm font-medium hover:border-[#12284A]"
        >
          Browse properties
        </Link>
      </div>
    </div>
  );
}
