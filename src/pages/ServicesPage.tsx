import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAgency } from '../context/AgencyContext';

export function ServicesPage() {
  const { siteSettings } = useAgency();

  useEffect(() => {
    document.title = `Services — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  const serviceList = [
    {
      num: '01.',
      title: 'Residential home sales & acquisition',
      desc: 'Guided buying and selling of single-storey and double-storey houses, corner villas, and family portions across Sahiwal, Bashir Town, and Rana Town.',
    },
    {
      num: '02.',
      title: 'Plot evaluation & investment advisory',
      desc: 'Sourcing and verification of residential and commercial plots along Hardosohal Road, Ahdian Road, and surrounding growth corridors.',
    },
    {
      num: '03.',
      title: 'Commercial retail & office leasing',
      desc: 'Matching shops, showrooms, medical clinics, and office suites with qualified commercial tenants under clear lease terms.',
    },
    {
      num: '04.',
      title: 'Agricultural land & farmhouse brokerage',
      desc: 'Advisory for canal-irrigated farmland and private farmhouse estates, including revenue record and access road verification.',
    },
    {
      num: '05.',
      title: 'Documentation & transfer coordination',
      desc: 'End-to-end coordination of token receipts, bayana agreements, registry, intiqal, and possession handovers.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
      <div className="space-y-4 border-b border-[#12284A]/10 pb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
          Real estate services
        </h1>
        <p className="text-base sm:text-lg text-[#4A5568] max-w-[65ch] leading-relaxed">
          Practical, transparent brokerage services covering residential homes, plots, commercial rentals, and agricultural properties.
        </p>
      </div>

      <div className="divide-y divide-[#12284A]/10 border-b border-[#12284A]/10">
        {serviceList.map((item) => (
          <div key={item.num} className="py-7 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
            <span className="md:col-span-1 font-mono text-sm text-[#C9B27C] font-medium">
              {item.num}
            </span>
            <h2 className="md:col-span-4 font-serif text-2xl font-semibold text-[#12284A]">
              {item.title}
            </h2>
            <p className="md:col-span-7 text-sm sm:text-base text-[#4A5568] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#12284A] text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
            Planning to buy, sell, or lease?
          </h2>
          <p className="text-sm text-[#F5F6F8]/80">
            Call {siteSettings.phone} or send us your property requirements directly.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-6 py-3 bg-[#C9B27C] text-[#12284A] text-sm font-semibold whitespace-nowrap text-center hover:bg-[#d5c18f]"
        >
          Contact our office
        </Link>
      </div>
    </div>
  );
}
