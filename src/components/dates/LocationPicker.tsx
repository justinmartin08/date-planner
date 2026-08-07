'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Loader2, X, Crosshair } from 'lucide-react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export interface PickedLocation {
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation | null) => void;
}

// Default center: kept generic (no hardcoded home address). Falls back to
// a world-ish view; a device geolocation prompt narrows it if allowed.
const DEFAULT_CENTER: [number, number] = [14.5, 121.0];
const DEFAULT_ZOOM = 12;

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState<
    Array<{ title: string; address: string; lat: number; lng: number; distanceKm?: number }>
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: 'application/json' } }
      );
      const data = await res.json();
      const address: string = data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onChange({ address, lat, lng });
    } catch {
      onChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
    }
  }, [onChange]);

  const placeMarker = useCallback(
    (L: typeof import('leaflet'), lat: number, lng: number) => {
      const map = leafletMapRef.current;
      if (!map) return;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });
      }
      map.panTo([lat, lng]);
    },
    [reverseGeocode]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled || !mapRef.current || leafletMapRef.current) return;

      // Fix Leaflet marker icon URLs under Next.js bundler
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const start: [number, number] = value ? [value.lat, value.lng] : DEFAULT_CENTER;

      const map = L.map(mapRef.current, {
        center: start,
        zoom: value ? 15 : DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      if (value) {
        placeMarker(L, value.lat, value.lng);
      }

      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, lat, lng);
        reverseGeocode(lat, lng);
      });

      setReady(true);
    })();

    return () => {
      cancelled = true;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Promise-based geolocation so "Use my location" can be triggered on demand
  // (a user gesture) and also awaited before a category search.
  const getPosition = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        resolve(null);
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, maximumAge: 60000 }
      );
    }).finally(() => setLocating(false));
  }, []);

  const handleLocateMe = useCallback(async () => {
    setLocateError('');
    const coords = await getPosition();
    if (!coords) {
      setLocateError('Location access was denied. Results will still show, but without distance ordering.');
      return;
    }
    setUserCoords(coords);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([coords.lat, coords.lng], 13);
    }
  }, [getPosition]);

  // Auto-detect user location on first mount so searches are nearest-first
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLocateMe();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced proximity-biased search querying server-side API endpoint (/api/location/search)
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(
      async () => {
        if (!trimmed || trimmed.length < 2) {
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }

        setSearching(true);
        try {
          const searchUrl = userCoords
            ? `/api/location/search?q=${encodeURIComponent(trimmed)}&lat=${userCoords.lat}&lng=${userCoords.lng}`
            : `/api/location/search?q=${encodeURIComponent(trimmed)}`;

          const res = await fetch(searchUrl);
          const data = await res.json();
          if (data?.results?.length > 0) {
            setSuggestions(data.results);
            setShowDropdown(true);
            setSearchError('');
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
        } catch {
          setSuggestions([]);
        } finally {
          setSearching(false);
        }
      },
      trimmed && trimmed.length >= 2 ? 300 : 0
    );

    return () => clearTimeout(timer);
  }, [query, userCoords]);

  const handleSelectSuggestion = async (item: { title: string; address: string; lat: number; lng: number }) => {
    setShowDropdown(false);
    setSuggestions([]);
    const L = await import('leaflet');
    placeMarker(L, item.lat, item.lng);
    leafletMapRef.current?.setView([item.lat, item.lng], 16);
    onChange({ address: item.address, lat: item.lat, lng: item.lng });
  };

  const handleSearch = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || !leafletMapRef.current) return;
    setSearching(true);
    setSearchError('');
    try {
      const searchUrl = userCoords
        ? `/api/location/search?q=${encodeURIComponent(query.trim())}&lat=${userCoords.lat}&lng=${userCoords.lng}`
        : `/api/location/search?q=${encodeURIComponent(query.trim())}`;

      const res = await fetch(searchUrl);
      const data = await res.json();
      if (!data?.results?.length) {
        setSearchError('No matching places found. Try typing a specific mall, city, or landmark.');
        setShowDropdown(false);
        return;
      }
      setSuggestions(data.results);
      setShowDropdown(true);
    } catch {
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    if (markerRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    onChange(null);
  };

  return (
    <div className="space-y-2 relative">
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (showDropdown && suggestions.length > 0) setShowDropdown(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
          placeholder={
            userCoords
              ? 'Search nearby places, malls, or landmarks...'
              : 'Search places, malls, cities, or landmarks...'
          }
          className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-sm transition-colors"
        />
        {!userCoords && (
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            title="Use my current location"
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-medium disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
        </button>

        {/* Real-Time Google Maps Style Autocomplete Dropdown Menu */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0F1420] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[9999] max-h-64 overflow-y-auto py-1 backdrop-blur-2xl animate-fadeIn">
            <div className="px-4 py-1.5 text-[10px] font-semibold text-emerald-400 border-b border-white/10 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>
                {userCoords && suggestions.some((s) => s.distanceKm !== undefined)
                  ? 'Showing nearest places to your location'
                  : 'Showing places in your country'}
              </span>
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-3 hover:bg-white/10 text-xs text-white border-b border-white/5 last:border-0 flex items-start gap-3 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white shrink-0 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-white truncate text-xs group-hover:text-[var(--accent)] transition-colors">
                      {item.title}
                    </div>
                    {item.distanceKm !== undefined && (
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        {item.distanceKm < 1
                          ? `${Math.round(item.distanceKm * 1000)} m`
                          : `${item.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                  {item.address && item.address !== item.title && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
                      {item.address}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {(searchError || locateError) && (
        <p className="text-xs text-rose-400">{searchError || locateError}</p>
      )}

      <div className="map-picker relative rounded-lg overflow-hidden border border-[var(--border-color)]">
        <div ref={mapRef} className="w-full h-56" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading map…
          </div>
        )}
      </div>

      {value ? (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--border-color)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
          <span className="text-xs text-[var(--text-primary)] flex-1 leading-snug">{value.address}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
            title="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)]">Click the map or search to drop a pin (optional).</p>
      )}
    </div>
  );
}