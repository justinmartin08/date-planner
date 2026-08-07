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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const userLatStr = searchParams.get('lat');
  const userLngStr = searchParams.get('lng');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();
  const userLat = userLatStr ? parseFloat(userLatStr) : null;
  const userLng = userLngStr ? parseFloat(userLngStr) : null;

  try {
    // Build Nominatim URL with optional viewbox proximity bias
    let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      cleanQuery
    )}&limit=12&addressdetails=1`;

    if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
      // 1.5 degree bounding box around user (~150km bias window)
      const minLng = userLng - 1.5;
      const maxLng = userLng + 1.5;
      const minLat = userLat - 1.5;
      const maxLat = userLat + 1.5;
      nominatimUrl += `&viewbox=${minLng},${maxLat},${maxLng},${minLat}&bounded=0`;
    }

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DatePlannerWebsite/1.0 (https://date-planner-website-theta.vercel.app)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    let rawResults: Array<{ title: string; address: string; lat: number; lng: number; distanceKm?: number }> = [];

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        rawResults = data.map((item) => {
          const itemLat = parseFloat(item.lat);
          const itemLng = parseFloat(item.lon);
          const dist =
            userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)
              ? getDistanceKm(userLat, userLng, itemLat, itemLng)
              : undefined;

          return {
            title: item.name || item.display_name.split(', ')[0],
            address: item.display_name,
            lat: itemLat,
            lng: itemLng,
            distanceKm: dist,
          };
        });
      }
    }

    // Fallback or secondary provider: Komoot Photon API (natively ranks by distance using lat/lon)
    if (rawResults.length < 5) {
      let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=10`;
      if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        photonUrl += `&lat=${userLat}&lon=${userLng}`;
      }

      const photonRes = await fetch(photonUrl, {
        headers: { 'Accept-Language': 'en' },
      });

      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData?.features?.length > 0) {
          const photonResults = photonData.features.map((feat: any) => {
            const props = feat.properties;
            const coords = feat.geometry.coordinates; // [lng, lat]
            const name = props.name || props.street || props.city || cleanQuery;
            const addressParts = [
              props.name,
              props.street,
              props.district,
              props.city,
              props.state,
              props.country,
            ].filter(Boolean);
            const address = Array.from(new Set(addressParts)).join(', ');

            const itemLat = coords[1];
            const itemLng = coords[0];
            const dist =
              userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)
                ? getDistanceKm(userLat, userLng, itemLat, itemLng)
                : undefined;

            return {
              title: name,
              address: address || name,
              lat: itemLat,
              lng: itemLng,
              distanceKm: dist,
            };
          });

          // Merge without duplicates
          const existingAddrs = new Set(rawResults.map((r) => r.address));
          for (const item of photonResults) {
            if (!existingAddrs.has(item.address)) {
              rawResults.push(item);
              existingAddrs.add(item.address);
            }
          }
        }
      }
    }

    // Sort by distance if user location is present (nearest first!)
    if (userLat !== null && userLng !== null) {
      rawResults.sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return NextResponse.json({ results: rawResults.slice(0, 8) });
  } catch (err) {
    console.error('Proximity location search API error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
