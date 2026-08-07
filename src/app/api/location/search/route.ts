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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const userLatStr = searchParams.get('lat');
  const userLngStr = searchParams.get('lng');

  const userLat = userLatStr ? parseFloat(userLatStr) : null;
  const userLng = userLngStr ? parseFloat(userLngStr) : null;
  const hasCoords = userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng);

  try {
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