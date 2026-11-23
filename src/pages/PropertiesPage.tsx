import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAgency } from '../context/AgencyContext';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyQuickInquiryModal } from '../components/PropertyQuickInquiryModal';
import { Property, PropertyPurpose, PropertyType } from '../types';

const PAGE_SIZE = 9;

function toMarlaEquivalent(value: number, unit: Property['areaUnit']): number {
  switch (unit) {
    case 'marla':
      return value;
    case 'kanal':
      return value * 20;
    case 'acre':
      return value * 160;
    case 'sq_ft':
      return value / 225;
  }
}

export function PropertiesPage() {
  const { properties, siteSettings, usingFallbackData } = useAgency();

  const [keyword, setKeyword] = useState('');
  const [purpose, setPurpose] = useState<'all' | PropertyPurpose>('all');
  const [type, setType] = useState<'all' | PropertyType>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [minAreaMarla, setMinAreaMarla] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [page, setPage] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    document.title = `Properties — ${siteSettings.agencyName}`;
  }, [siteSettings.agencyName]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;
    const minM = minAreaMarla ? Number(minAreaMarla) : null;

    const list = properties.filter((p) => {
      if (purpose !== 'all' && p.purpose !== purpose) return false;
      if (type !== 'all' && p.type !== type) return false;
      if (minP !== null && !Number.isNaN(minP) && p.pricePkr < minP) return false;
      if (maxP !== null && !Number.isNaN(maxP) && p.pricePkr > maxP) return false;
      if (minBedrooms > 0 && p.bedrooms < minBedrooms) return false;
      if (minM !== null && !Number.isNaN(minM)) {
        if (toMarlaEquivalent(p.areaValue, p.areaUnit) < minM) return false;
      }
      if (kw) {
        const hay = `${p.title} ${p.areaName} ${p.address} ${p.description} ${p.type}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePkr - b.pricePkr;
      if (sortBy === 'price_desc') return b.pricePkr - a.pricePkr;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [properties, keyword, purpose, type, minPrice, maxPrice, minBedrooms, minAreaMarla, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setKeyword('');
    setPurpose('all');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms(0);
    setMinAreaMarla('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="pb-8 border-b border-[#12284A]/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#12284A]">
            Properties
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#4A5568] max-w-[60ch]">
            Browse verified houses, plots, apartments, shops, offices, and agricultural land across Sahiwal and Ferozewala.
            {usingFallbackData && ' Sample placeholder listings are currently displayed.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFiltersMobile((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A]"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>{showFiltersMobile ? 'Hide filters' : 'Filters'}</span>
          </button>

          <label className="flex items-center gap-2 text-xs text-[#4A5568]">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc');
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-[#12284A]/20 text-xs font-medium text-[#12284A]"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </label>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`mt-6 bg-white border border-[#12284A]/10 p-5 ${
          showFiltersMobile ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="filter-keyword" className="block text-xs font-medium text-[#12284A] mb-1">
              Keyword or area
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#4A5568] absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="filter-keyword"
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="Rana Town, GT Road, corner..."
                className="w-full pl-9 pr-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-purpose" className="block text-xs font-medium text-[#12284A] mb-1">
              Purpose
            </label>
            <select
              id="filter-purpose"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value as 'all' | PropertyPurpose);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A] bg-white"
            >
              <option value="all">Buy &amp; Rent</option>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-type" className="block text-xs font-medium text-[#12284A] mb-1">
              Property type
            </label>
            <select
              id="filter-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'all' | PropertyType);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A] bg-white"
            >
              <option value="all">All types</option>
              <option value="house">House</option>
              <option value="plot">Plot</option>
              <option value="apartment">Apartment</option>
              <option value="shop">Shop</option>
              <option value="office">Office</option>
              <option value="agricultural_land">Agricultural land</option>
              <option value="commercial_building">Commercial building</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-beds" className="block text-xs font-medium text-[#12284A] mb-1">
              Bedrooms
            </label>
            <select
              id="filter-beds"
              value={minBedrooms}
              onChange={(e) => {
                setMinBedrooms(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A] bg-white"
            >
              <option value={0}>Any</option>
              <option value={1}>1+ Bed</option>
              <option value={2}>2+ Bed</option>
              <option value={3}>3+ Bed</option>
              <option value={4}>4+ Bed</option>
              <option value={5}>5+ Bed</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-min-price" className="block text-xs font-medium text-[#12284A] mb-1">
              Min price (PKR)
            </label>
            <input
              id="filter-min-price"
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 5000000"
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A] tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="filter-max-price" className="block text-xs font-medium text-[#12284A] mb-1">
              Max price (PKR)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 60000000"
              className="w-full px-3 py-2 border border-[#12284A]/20 text-sm text-[#12284A] tabular-nums"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#12284A]/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="filter-area" className="text-xs font-medium text-[#12284A]">
              Minimum area (Marla eq.):
            </label>
            <input
              id="filter-area"
              type="number"
              min={0}
              value={minAreaMarla}
              onChange={(e) => {
                setMinAreaMarla(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 10"
              className="w-28 px-3 py-1.5 border border-[#12284A]/20 text-xs text-[#12284A] tabular-nums"
            />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#4A5568] tabular-nums">
              Showing {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[#12284A] font-medium hover:underline"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {paginated.length === 0 ? (
        <div className="mt-12 bg-white border border-[#12284A]/10 p-12 text-center space-y-3">
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            No matching properties found
          </h2>
          <p className="text-sm text-[#4A5568] max-w-md mx-auto">
            Try clearing some filters or call us on {siteSettings.phone} to ask about off-market properties that match your requirements.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-5 py-2.5 bg-[#12284A] text-white text-xs font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {paginated.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onInquire={(prop) => setSelectedProperty(prop)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A] disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum)}
              className={`px-3.5 py-2 text-xs font-medium tabular-nums border ${
                pageNum === safePage
                  ? 'bg-[#12284A] text-white border-[#12284A]'
                  : 'bg-white text-[#12284A] border-[#12284A]/20 hover:border-[#12284A]'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border border-[#12284A]/20 bg-white text-xs font-medium text-[#12284A] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <PropertyQuickInquiryModal
        property={selectedProperty}
        sourcePage="/properties"
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
