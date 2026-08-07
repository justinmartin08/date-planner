import { NextResponse } from 'next/server';

// Haversine formula to compute distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Home-country bounding box (Philippines) used when the user hasn't shared
// their location, so results stay local like Google Maps instead of returning
// random places from the other side of the world.
const HOME_COUNTRY_BBOX = '116.93,4.59,126.60,21.12'; // minLon,minLat,maxLon,maxLat

interface SearchResult {
  title: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  category?: string;
}

// Photon (Komoot) — free geocoder that ranks by distance when lat/lon are given.
// This is the primary provider: with coordinates it returns "nearest first",
// and with a bbox it is scoped to a region (e.g. the home country).
async function searchPhoton(
  q: string,
  userLat: number | null,
  userLng: number | null,
  bbox?: string
): Promise<SearchResult[]> {
  const url = new URL('https://photon.komoot.io/api/');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '12');
  url.searchParams.set('lang', 'en');

  if (userLat !== null && userLng !== null) {
    url.searchParams.set('lat', String(userLat));
    url.searchParams.set('lon', String(userLng));
    // Default bias radius (~1000 km) ranks nearby places first; we re-sort
    // strictly by Haversine distance afterwards for a Google-like "nearest".
  } else if (bbox) {
    url.searchParams.set('bbox', bbox);
  }

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const results: SearchResult[] = [];
  for (const feat of data?.features ?? []) {
    const props = feat?.properties ?? {};
    const coords = feat?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    const itemLat = coords[1];
    const itemLng = coords[0];
    const parts = [props.name, props.street, props.district, props.city, props.state, props.country]
      .filter(Boolean);
    const address = Array.from(new Set(parts)).join(', ');
    if (!parts.length) continue;

    results.push({
      title: props.name || props.city || props.state || parts[0],
      address,
      lat: itemLat,
      lng: itemLng,
      distanceKm:
        userLat !== null && userLng !== null
          ? getDistanceKm(userLat, userLng, itemLat, itemLng)
          : undefined,
      category: props.osm_value ?? undefined,
    });
  }
  return results;
}

// Nominatim (OpenStreetMap) — worldwide fallback. Ranks by importance (i.e.
// popularity/well-known places). Only used when Photon fails or finds nothing
// so that explicit foreign searches like "Tokyo" still resolve.
async function nominatimSearch(q: string, userLat: number | null, userLng: number | null): Promise<SearchResult[]> {
  let url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    q
  )}&limit=10&addressdetails=1`;

  if (userLat !== null && userLng !== null) {
    // Weak proximity hint (bounded=0 means "prefer", not "restrict").
    const minLng = userLng - 1.5;
    const maxLng = userLng + 1.5;
    const minLat = userLat - 1.5;
    const maxLat = userLat + 1.5;
    url += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=0`;
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'DatePlannerWebsite/1.0 (https://date-planner-website-theta.vercel.app)',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return (
    data as Array<{ name?: string; display_name: string; lat: string; lon: string }>
  ).map((item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    return {
      title: item.name || item.display_name.split(', ')[0],
      address: item.display_name,
      lat,
      lng,
      distanceKm:
        userLat !== null && userLng !== null ? getDistanceKm(userLat, userLng, lat, lng) : undefined,
    };
  });
}

// Overpass API — real "popular places near me" category search (Google-style),
// e.g. every cafe/restaurant/park within a radius of the user.
interface CategoryDef {
  label: string;
  tags: string[];
  radiusKm: number;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const CATEGORY_QUERIES: Record<string, CategoryDef> = {
  cafe: { label: 'Cafés', tags: ['amenity=cafe'], radiusKm: 8 },
  restaurant: {
    label: 'Restaurants',
    tags: ['amenity=restaurant', 'amenity=fast_food', 'amenity=food_court'],
    radiusKm: 8,
  },
  park: { label: 'Parks', tags: ['leisure=park', 'leisure=garden'], radiusKm: 10 },
  mall: { label: 'Malls', tags: ['shop=mall', 'amenity=marketplace'], radiusKm: 15 },
  cinema: { label: 'Cinema & theaters', tags: ['amenity=cinema', 'amenity=theatre'], radiusKm: 15 },
  beach: { label: 'Beaches', tags: ['natural=beach'], radiusKm: 25 },
  attraction: {
    label: 'Attractions',
    tags: ['tourism=attraction', 'tourism=museum', 'tourism=zoo', 'tourism=theme_park'],
    radiusKm: 15,
  },
};

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(mirror: string, query: string): Promise<OverpassElement[] | null> {
  const res = await fetch(mirror, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Accept': 'application/json',
      'User-Agent': 'DatePlannerWebsite/1.0 (https://date-planner-website-theta.vercel.app)',
    },
    body: query,
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { elements?: OverpassElement[] };
  return data?.elements ?? null;
}

async function searchByCategory(category: string, userLat: number, userLng: number): Promise<SearchResult[]> {
  const def = CATEGORY_QUERIES[category];
  if (!def) return [];

  const radius = def.radiusKm * 1000;
  const statements = def.tags
    .map((tag) => {
      const [k, v] = tag.split('=');
      return `node["${k}"="${v}"](around:${radius},${userLat},${userLng});way["${k}"="${v}"](around:${radius},${userLat},${userLng});`;
    })
    .join('');
  const query = `[out:json][timeout:15];(${statements});out center 15;`;

  // Alternate the starting mirror so traffic spreads across the public API
  const start = Math.random() < 0.5 ? 0 : 1;
  const mirrors = [OVERPASS_MIRRORS[start], OVERPASS_MIRRORS[1 - start]];

  for (const mirror of mirrors) {
    try {
      const elements = await queryOverpass(mirror, query);
      if (!elements || elements.length === 0) continue;

      const results: SearchResult[] = [];
      const seen = new Set<string>();
      for (const el of elements) {
        const tags = el?.tags ?? {};
        const name = tags.name || tags['name:en'] || tags.brand || '';
        const lat = el.type === 'node' ? el.lat : el.center?.lat;
        const lng = el.type === 'node' ? el.lon : el.center?.lon;
        if (typeof lat !== 'number' || typeof lng !== 'number' || !name) continue;

        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const address = [
          tags['addr:street'],
          tags['addr:suburb'] || tags['addr:city'] || tags['addr:place'],
          tags['addr:province'] || tags['addr:region'],
        ]
          .filter(Boolean)
          .join(', ');

        results.push({
          title: name,
          address: address || 'Local spot',
          lat,
          lng,
          distanceKm: getDistanceKm(userLat, userLng, lat, lng),
          category: def.label,
        });
      }
      if (results.length > 0) return results;
    } catch {
      // try the next mirror
    }
  }

  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('cat');
  const query = searchParams.get('q');
  const userLatStr = searchParams.get('lat');
  const userLngStr = searchParams.get('lng');

  const userLat = userLatStr ? parseFloat(userLatStr) : null;
  const userLng = userLngStr ? parseFloat(userLngStr) : null;
  const hasCoords = userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng);

  try {
    // Category mode: popular places near the selected location
    if (category && hasCoords) {
      const results = await searchByCategory(category, userLat as number, userLng as number);
      return NextResponse.json({ results: results.slice(0, 8) });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }
    const cleanQuery = query.trim();
    const coords = hasCoords ? { lat: userLat as number, lng: userLng as number } : null;

    let results: SearchResult[] = [];
    let photonErrored = false;
    try {
      if (coords) {
        // Nearest-first worldwide search
        results = await searchPhoton(cleanQuery, coords.lat, coords.lng);
      } else {
        // Home-country results first, merged with worldwide matches below them
        const [home, worldwide] = await Promise.all([
          searchPhoton(cleanQuery, null, null, HOME_COUNTRY_BBOX),
          searchPhoton(cleanQuery, null, null),
        ]);
        const seen = new Set(home.map((r) => r.address));
        results = [...home.slice(0, 5), ...worldwide.filter((r) => !seen.has(r.address))];
      }
    } catch (err) {
      photonErrored = true;
      console.error('Photon search error:', err);
    }

    // Worldwide, popularity-ranked fallback when Photon fails or finds nothing.
    if (photonErrored || results.length === 0) {
      const fallback = await nominatimSearch(cleanQuery, coords?.lat ?? null, coords?.lng ?? null);
      const seen = new Set(results.map((r) => r.address));
      results.push(...fallback.filter((r) => !seen.has(r.address)));
    }

    // Nearest first when we know the user's location
    if (hasCoords) {
      results.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return NextResponse.json({ results: results.slice(0, 8) });
  } catch (err) {
    console.error('Location search API error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}