import { useState } from 'react';
import { ExternalLink, MapPin, Loader2 } from 'lucide-react';
import { MapsInsightResult } from '../types';

interface MapsInsightsPanelProps {
  locationQuery: string;
  lat?: number | null;
  lng?: number | null;
  fallbackMapsUrl?: string;
}

export function MapsInsightsPanel({
  locationQuery,
  lat,
  lng,
  fallbackMapsUrl,
}: MapsInsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MapsInsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/maps-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: locationQuery, lat, lng }),
      });
      const json = (await res.json()) as MapsInsightResult & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || 'Could not load neighborhood map data.');
      }
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retrieve Maps data.');
    } finally {
      setLoading(false);
    }
  };

  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  const embedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : null;

  return (
    <div className="bg-white border border-[#12284A]/10 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#12284A]">
            Location &amp; Nearby Landmarks
          </h2>
          <p className="text-sm text-[#4A5568] mt-1">{locationQuery}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleFetchInsights}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#12284A] text-white text-xs font-medium hover:bg-[#0D1E38] disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9B27C]" aria-hidden="true" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#C9B27C]" aria-hidden="true" />
            )}
            <span>{loading ? 'Checking Google Maps...' : 'Check nearby landmarks'}</span>
          </button>

          {fallbackMapsUrl && (
            <a
              href={fallbackMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#12284A]/20 text-xs font-medium text-[#12284A] hover:border-[#12284A]"
            >
              <span>Open Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      {embedSrc && (
        <div className="aspect-[16/9] w-full bg-[#E8ECF2] border border-[#12284A]/10 overflow-hidden">
          <iframe
            title={`Map for ${locationQuery}`}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
          />
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      {result && (
        <div className="pt-4 border-t border-[#12284A]/10 space-y-4">
          <div className="text-sm text-[#4A5568] leading-relaxed whitespace-pre-line">
            {result.summary}
          </div>

          {result.places.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#12284A]">
                Verified Google Maps places
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.places.map((place, idx) => (
                  <li
                    key={`${place.uri}-${idx}`}
                    className="p-3 bg-[#F5F6F8] border border-[#12284A]/10 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <a
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-[#12284A] hover:underline inline-flex items-center gap-1"
                      >
                        <span className="truncate">{place.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-[#C9B27C]" aria-hidden="true" />
                      </a>
                      {place.snippets[0] && (
                        <p className="text-xs text-[#4A5568] mt-1 line-clamp-2">
                          {place.snippets[0]}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
