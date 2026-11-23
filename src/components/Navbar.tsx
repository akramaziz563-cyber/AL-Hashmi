import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Phone, X } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';

export function Navbar() {
  const { siteSettings } = useAgency();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Properties', to: '/properties' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Services', to: '/services' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const telHref = `tel:${siteSettings.phone.replace(/\s+/g, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-[#F5F6F8]/95 backdrop-blur-sm border-b border-[#12284A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#12284A] whitespace-nowrap shrink-0"
        >
          Al Hashmi Real Estate
        </Link>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                  isActive
                    ? 'text-[#12284A] border-[#C9B27C]'
                    : 'text-[#4A5568] border-transparent hover:text-[#12284A] hover:border-[#C9B27C]/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={telHref}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#12284A] text-white text-sm font-medium hover:bg-[#0D1E38] transition-colors whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
            <span>Call {siteSettings.phone}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2.5 text-[#12284A] border border-[#12284A]/15 hover:bg-white transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#12284A]/10 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#F5F6F8] text-[#12284A]' : 'text-[#4A5568] hover:text-[#12284A]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-[#12284A]/10 flex flex-col gap-2">
            <a
              href={telHref}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#12284A] text-white text-sm font-medium"
            >
              <Phone className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
              <span>Call {siteSettings.phone}</span>
            </a>
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2 text-xs text-[#4A5568] hover:text-[#12284A]"
            >
              Staff Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
