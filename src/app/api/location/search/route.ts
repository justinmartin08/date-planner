import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = query.trim();

  try {
    // Primary Provider: OpenStreetMap Nominatim with official User-Agent header
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      cleanQuery
    )}&limit=10&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DatePlannerWebsite/1.0 (https://date-planner-website-theta.vercel.app)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 }, // Cache search queries for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item) => ({
          title: item.name || item.display_name.split(', ')[0],
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: item.type || item.category || 'place',
        }));
        return NextResponse.json({ results: formatted });
      }
    }

    // Fallback Provider: Komoot Photon API (global OpenStreetMap search with zero CORS/rate-limits)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=10`;
    const photonRes = await fetch(photonUrl, {
      headers: { 'Accept-Language': 'en' },
    });

    if (photonRes.ok) {
      const photonData = await photonRes.json();
      if (photonData?.features?.length > 0) {
        const formatted = photonData.features.map((feat: any) => {
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

          return {
            title: name,
            address: address || name,
            lat: coords[1],
            lng: coords[0],
            category: props.osm_value || 'place',
          };
        });
        return NextResponse.json({ results: formatted });
      }
    }

    return NextResponse.json({ results: [] });
  } catch (err) {
    console.error('Location search API error:', err);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
