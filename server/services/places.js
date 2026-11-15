import { supabase } from '../lib/supabase.js';

const CACHE_DAYS = 30;          // Google allows caching lat/lng for up to 30 days
const MIN_CACHED = 15;          // below this, go to Google

const CUISINE_TYPES = {
  malay: 'malaysian_restaurant', chinese: 'chinese_restaurant',
  indian: 'indian_restaurant', thai: 'thai_restaurant',
  japanese: 'japanese_restaurant', korean: 'korean_restaurant',
  western: 'american_restaurant', seafood: 'seafood_restaurant',
  cafe: 'cafe', fastfood: 'fast_food_restaurant',
};

function bbox(lat, lng, radius) {
  const dLat = radius / 111_000;
  const dLng = radius / (111_000 * Math.cos((lat * Math.PI) / 180));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}

async function fetchFromGoogle(lat, lng, radius, type) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types',
    },
    body: JSON.stringify({
      includedTypes: [type],
      maxResultCount: 20,
      locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
    }),
  });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
  const json = await res.json();

  return (json.places ?? []).map((p) => ({
    place_id: p.id,
    name: p.displayName?.text ?? 'Unknown',
    address: p.formattedAddress ?? null,
    lat: p.location.latitude,
    lng: p.location.longitude,
    rating: p.rating ?? null,
    price_level: p.priceLevel ?? null,
    rating_count: p.userRatingCount ?? 0,
    types: p.types ?? [],
    fetched_at: new Date().toISOString(),
  }));
}

export async function getNearbyPlaces({ lat, lng, radius, cuisine }) {
  const type = CUISINE_TYPES[cuisine] ?? 'restaurant';
  const b = bbox(lat, lng, radius);
  const since = new Date(Date.now() - CACHE_DAYS * 864e5).toISOString();

  let q = supabase.from('places_cache').select('*')
    .gte('lat', b.minLat).lte('lat', b.maxLat)
    .gte('lng', b.minLng).lte('lng', b.maxLng)
    .gte('fetched_at', since);
  if (type !== 'restaurant') q = q.contains('types', [type]);

  const { data: cached } = await q;
  if (cached && cached.length >= MIN_CACHED) return cached;

  const fresh = await fetchFromGoogle(lat, lng, radius, type);
  if (fresh.length) await supabase.from('places_cache').upsert(fresh, { onConflict: 'place_id' });
  return fresh.length ? fresh : cached ?? [];
}