import { supabase } from '../lib/supabase.js';
import { km, bbox } from '../lib/geo.js';

const CACHE_DAYS = 30;          // Google allows caching lat/lng for up to 30 days
const MIN_CACHED = 15;          // below this, go to Google

const CUISINE_TYPES = {
  malay: 'malaysian_restaurant', chinese: 'chinese_restaurant',
  indian: 'indian_restaurant', thai: 'thai_restaurant',
  japanese: 'japanese_restaurant', korean: 'korean_restaurant',
  western: 'american_restaurant', seafood: 'seafood_restaurant',
  cafe: 'cafe', fastfood: 'fast_food_restaurant',
};

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

// Areas we already asked Google about recently (~1 km grid). Sparse areas never reach
// MIN_CACHED, so without this every request there would hit Google again.
// In-memory: resets on restart, which only costs one extra call per area.
const RECENT_MS = 24 * 3600e3;
const recentSearches = new Map();
const searchKey = (type, lat, lng, radius) => `${type}:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`;

function searchedRecently(key) {
  const t = recentSearches.get(key);
  return t != null && Date.now() - t < RECENT_MS;
}

function markSearched(key) {
  recentSearches.set(key, Date.now());
  if (recentSearches.size > 5000) recentSearches.delete(recentSearches.keys().next().value); // oldest
}

export async function getNearbyPlaces({ lat, lng, radius, cuisine }) {
  const type = CUISINE_TYPES[cuisine] ?? 'restaurant';
  const b = bbox(lat, lng, radius);
  const since = new Date(Date.now() - CACHE_DAYS * 864e5).toISOString();

  // Always filter by type: otherwise cafe-only rows could satisfy a plain "restaurant" search
  const { data, error } = await supabase.from('places_cache').select('*')
    .gte('lat', b.minLat).lte('lat', b.maxLat)
    .gte('lng', b.minLng).lte('lng', b.maxLng)
    .gte('fetched_at', since)
    .contains('types', [type])
    .order('rating_count', { ascending: false })
    .limit(300);
  if (error) console.error('places_cache read:', error.message);   // fall through to Google

  // The bbox is a square; count only rows inside the actual circle
  const cached = (data ?? []).filter((p) => km(lat, lng, p.lat, p.lng) * 1000 <= radius);
  const key = searchKey(type, lat, lng, radius);
  if (cached.length >= MIN_CACHED || (cached.length && searchedRecently(key))) return cached;

  const fresh = await fetchFromGoogle(lat, lng, radius, type);
  markSearched(key);
  if (fresh.length) {
    const { error: upErr } = await supabase.from('places_cache').upsert(fresh, { onConflict: 'place_id' });
    if (upErr) console.error('places_cache upsert:', upErr.message);
  }
  return fresh.length ? fresh : cached;
}