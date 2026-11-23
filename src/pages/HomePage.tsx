import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Star } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { HeroArchIllustration } from '../components/HeroArchIllustration';
import { PropertyCard } from '../components/PropertyCard';
import { InquiryForm } from '../components/InquiryForm';
import { PropertyQuickInquiryModal } from '../components/PropertyQuickInquiryModal';
import { Property } from '../types';

export function HomePage() {
  const { properties, siteSettings, usingFallbackData } = useAgency();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    document.title = `${siteSettings.agencyName} — Verified Property Advisory`;
  }, [siteSettings.agencyName]);

  const featuredProperties = properties.filter((p) => p.featured).slice(0, 6);
  const displayProperties =
    featuredProperties.length > 0 ? featuredProperties : properties.slice(0, 6);

  const telHref = `tel:${siteSettings.phone.replace(/\s+/g, '')}`;

  const services = [
    {
      num: '01.',
      title: 'Residential buying & selling',
      detail:
        'Independent homes, corner villas, and family portions evaluated on construction quality, utility connections, and fair market value.',
    },
    {
      num: '02.',
      title: 'Residential & commercial plots',
      detail:
        'Demarcated plots along main corridors and established housing blocks, backed by registry, intiqal, and fard verification.',
    },
    {
      num: '03.',
      title: 'Commercial leasing & showrooms',
      detail:
        'Retail shops, corporate offices, and highway-facing plazas matched to operational visibility and long-term lease stability.',
    },
    {
      num: '04.',
      title: 'Agricultural land & estates',
      detail:
        'Canal-irrigated acreage and country farmhouses across the surrounding Punjab belt with clear revenue record checks.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Share your requirement',
      body: 'Tell us your preferred location, plot or home size, purpose, and budget range by phone, WhatsApp, or office visit.',
    },
    {
      step: '02',
      title: 'Shortlist & site visit',
      body: 'We arrange structured inspections of genuine options without wasting your time on unavailable or misrepresented listings.',
    },
    {
      step: '03',
      title: 'Document verification',
      body: 'Before any commitment, ownership records, possession status, and transfer requirements are reviewed transparently.',
    },
    {
      step: '04',
      title: 'Clean handover',
      body: 'We coordinate directly with both buyer and seller through token, bayana, and final registry or lease execution.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#12284A] text-white border-b border-[#C9B27C]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-sm text-[#C9B27C]">
                <Star className="w-4 h-4 fill-[#C9B27C]" aria-hidden="true" />
                <span className="tabular-nums font-medium">
                  {siteSettings.googleRating.toFixed(1)} Google rating from {siteSettings.reviewCount} reviews
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-2xl">
                {siteSettings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#F5F6F8]/80 max-w-[60ch] leading-relaxed">
                {siteSettings.heroSubheadline}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9B27C] text-[#12284A] text-sm font-semibold hover:bg-[#d5c18f] transition-colors whitespace-nowrap"
                >
                  <span>Browse properties</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-sm font-medium hover:border-[#C9B27C] hover:text-[#C9B27C] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call now · {siteSettings.phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroArchIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#12284A]/10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12284A]">
              Featured properties
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4A5568] max-w-[62ch]">
              Selected residential homes, plots, and commercial spaces currently available through our office.
              {usingFallbackData && ' Sample placeholder listings are shown until you publish your own.'}
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#12284A] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            <span>View all properties</span>
            <ArrowRight className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {displayProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onInquire={(prop) => setSelectedProperty(prop)}
            />
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-white border-y border-[#12284A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12284A]">
                Advisory across residential, plot, and commercial deals
              </h2>
              <p className="text-sm sm:text-base text-[#4A5568] max-w-[45ch] leading-relaxed">
                Whether you are buying a family home, securing a commercial frontage, or leasing office space, we guide every stage in plain terms.
              </p>
              <div className="pt-2">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#12284A] hover:underline underline-offset-4"
                >
                  <span>Explore all services</span>
                  <ArrowRight className="w-4 h-4 text-[#C9B27C]" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#12284A]/10 border-t border-b border-[#12284A]/10">
              {services.map((service) => (
                <div
                  key={service.num}
                  className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-baseline"
                >
                  <span className="sm:col-span-1 font-mono text-sm text-[#C9B27C] font-medium">
                    {service.num}
                  </span>
                  <h3 className="sm:col-span-4 font-serif text-xl font-semibold text-[#12284A]">
                    {service.title}
                  </h3>
                  <p className="sm:col-span-7 text-sm text-[#4A5568] leading-relaxed">
                    {service.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12284A]">
              Why families and buyers trust Al Hashmi Real Estate
            </h2>
            <p className="text-sm sm:text-base text-[#4A5568] max-w-[55ch] leading-relaxed">
              Our reputation is built on straightforward pricing, verified local ownership records, and attentive follow-through from first call to final registry.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">
            <div className="space-y-2 border-t-2 border-[#C9B27C] pt-4">
              <div className="font-serif text-3xl font-semibold text-[#12284A] tabular-nums">
                {siteSettings.googleRating.toFixed(1)} / 5
              </div>
              <h3 className="text-sm font-semibold text-[#12284A]">
                Rated by {siteSettings.reviewCount} Google reviews
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Verified client feedback reflecting consistent, respectful service on every transaction.
              </p>
            </div>

            <div className="space-y-2 border-t-2 border-[#12284A]/20 pt-4">
              <div className="font-serif text-3xl font-semibold text-[#12284A]">
                Local focus
              </div>
              <h3 className="text-sm font-semibold text-[#12284A]">
                On-the-ground corridor knowledge
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Direct familiarity with Sahiwal, Bashir Town, Rana Town, Hardosohal Road, and Ahdian Road sectors.
              </p>
            </div>

            <div className="space-y-2 border-t-2 border-[#12284A]/20 pt-4">
              <div className="font-serif text-3xl font-semibold text-[#12284A]">
                Plain dealing
              </div>
              <h3 className="text-sm font-semibold text-[#12284A]">
                Transparent meetings & paperwork
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Direct buyer-seller clarity on asking rates, commission terms, and title documents before token stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work — 4 Steps */}
      <section className="bg-[#12284A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl space-y-3 pb-10 border-b border-white/15">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
              How we work
            </h2>
            <p className="text-sm sm:text-base text-[#F5F6F8]/75">
              Four clear steps from your initial call to verified possession and transfer.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="space-y-3">
                <span className="font-mono text-sm text-[#C9B27C] block tabular-nums">
                  Step {item.step}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-[#F5F6F8]/75 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#12284A]">
              Speak with our office directly
            </h2>
            <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed max-w-[50ch]">
              Visit us in person or send an inquiry below. We respond promptly during working hours and arrange property visits by appointment.
            </p>

            <div className="space-y-4 pt-2 text-sm text-[#4A5568]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#12284A]">Office address</p>
                  <p className="mt-0.5 leading-relaxed">{siteSettings.address}</p>
                  <a
                    href={siteSettings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1.5 text-xs font-medium text-[#12284A] underline underline-offset-4 hover:text-[#C9B27C]"
                  >
                    View location on Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C9B27C] shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#12284A]">Phone &amp; WhatsApp</p>
                  <a
                    href={telHref}
                    className="mt-0.5 block hover:text-[#12284A] tabular-nums"
                  >
                    {siteSettings.phone} (+92 300 8620646)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#12284A]/10 p-6 sm:p-8">
            <h3 className="font-serif text-2xl font-semibold text-[#12284A] mb-5">
              Send an inquiry
            </h3>
            <InquiryForm sourcePage="/" submitLabel="Send inquiry" />
          </div>
        </div>
      </section>

      <PropertyQuickInquiryModal
        property={selectedProperty}
        sourcePage="/"
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
