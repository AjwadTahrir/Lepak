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

// A plain "restaurant" search misses where cheap Malaysian food actually is:
// food courts, hawker centres, kopitiams and stalls tagged as takeaway.
const GENERAL_TYPES = ['restaurant', 'food_court', 'meal_takeaway', 'cafe'];

const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,'
  + 'places.userRatingCount,places.priceLevel,places.types';

// maxPrice -> Google price levels for Text Search
const PRICE_LEVELS = {
  1: ['PRICE_LEVEL_INEXPENSIVE'],
  2: ['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE'],
};

async function googlePost(method, body) {
  const res = await fetch(`https://places.googleapis.com/v1/places:${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify(body),
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

// Nearby Search: top 20 by popularity, can't filter by price
const nearbySearch = (lat, lng, radius, types) => googlePost('searchNearby', {
  includedTypes: types,
  maxResultCount: 20,
  locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
});

// Text Search CAN filter by price, so "murah" gets 20 cheap places instead of the few
// cheap ones among the 20 most popular. It only restricts to a rectangle, and accepts
// one type, so results are trimmed to the circle and the wanted types afterwards.
async function cheapSearch(lat, lng, radius, types, levels, cuisine) {
  const b = bbox(lat, lng, radius);
  const rows = await googlePost('searchText', {
    textQuery: cuisine ? `${cuisine} food` : 'food',
    ...(types.length === 1 && { includedType: types[0] }),
    priceLevels: levels,
    pageSize: 20,
    locationRestriction: { rectangle: {
      low: { latitude: b.minLat, longitude: b.minLng },
      high: { latitude: b.maxLat, longitude: b.maxLng },
    } },
  });
  return rows.filter((p) => p.types.some((t) => types.includes(t)));
}

// Areas we already asked Google about recently (~1 km grid). Sparse areas never reach
// MIN_CACHED, so without this every request there would hit Google again.
// In-memory: resets on restart, which only costs one extra call per area.
const RECENT_MS = 24 * 3600e3;
const recentSearches = new Map();
const searchKey = (kind, types, lat, lng, radius) =>
  `${kind}:${types.join('+')}:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`;

function searchedRecently(key) {
  const t = recentSearches.get(key);
  return t != null && Date.now() - t < RECENT_MS;
}

function markSearched(key) {
  recentSearches.set(key, Date.now());
  if (recentSearches.size > 5000) recentSearches.delete(recentSearches.keys().next().value); // oldest
}

// Cache first; Google only when the cache is thin and we haven't asked recently.
// levels (optional) limits the cache read to those price levels.
async function cachedOrFetch({ lat, lng, radius, types, levels, key, fetchFresh }) {
  const b = bbox(lat, lng, radius);
  const since = new Date(Date.now() - CACHE_DAYS * 864e5).toISOString();

  // Always filter by type: otherwise cafe-only rows could satisfy a "japanese" search.
  // overlaps = row has at least one of the wanted types.
  let q = supabase.from('places_cache').select('*')
    .gte('lat', b.minLat).lte('lat', b.maxLat)
    .gte('lng', b.minLng).lte('lng', b.maxLng)
    .gte('fetched_at', since)
    .overlaps('types', types);
  if (levels) q = q.in('price_level', levels);
  const { data, error } = await q.order('rating_count', { ascending: false }).limit(300);
  if (error) console.error('places_cache read:', error.message);   // fall through to Google

  // The bbox is a square; count only rows inside the actual circle
  const inCircle = (p) => km(lat, lng, p.lat, p.lng) * 1000 <= radius;
  const cached = (data ?? []).filter(inCircle);
  if (cached.length >= MIN_CACHED || (cached.length && searchedRecently(key))) return cached;

  const fresh = (await fetchFresh()).filter(inCircle);
  markSearched(key);
  if (fresh.length) {
    const { error: upErr } = await supabase.from('places_cache').upsert(fresh, { onConflict: 'place_id' });
    if (upErr) console.error('places_cache upsert:', upErr.message);
  }
  return fresh.length ? fresh : cached;
}

export async function getNearbyPlaces({ lat, lng, radius, cuisine, maxPrice }) {
  const types = CUISINE_TYPES[cuisine] ? [CUISINE_TYPES[cuisine]] : GENERAL_TYPES;
  const levels = PRICE_LEVELS[maxPrice];

  const [general, cheap] = await Promise.all([
    cachedOrFetch({ lat, lng, radius, types, key: searchKey('nearby', types, lat, lng, radius),
      fetchFresh: () => nearbySearch(lat, lng, radius, types) }),
    // Extra price-filtered search; if it fails, the general results are still fine
    levels && cachedOrFetch({ lat, lng, radius, types, levels,
      key: searchKey(`price${maxPrice}`, types, lat, lng, radius),
      fetchFresh: () => cheapSearch(lat, lng, radius, types, levels, cuisine),
    }).catch((e) => { console.error('cheap search:', e.message); return []; }),
  ]);

  if (!cheap?.length) return general;
  const byId = new Map(general.map((p) => [p.place_id, p]));
  for (const p of cheap) byId.set(p.place_id, p);
  return [...byId.values()];
}

// "Bangsar", "Mid Valley" -> { name, lat, lng }, or null if Google can't place it.
// Biased toward the user so "Taman Jaya" picks the nearby one, limited to Malaysia.
// Kept in memory: place names repeat a lot and their coordinates don't move.
const placeCache = new Map();
export async function geocodePlace(query, { lat, lng }) {
  const key = query.toLowerCase();
  if (placeCache.has(key)) return placeCache.get(key);

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.location',
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode: 'MY',
      pageSize: 1,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 50_000 } },
    }),
    signal: AbortSignal.timeout(5_000),
  });
  if (!res.ok) throw new Error(`Places searchText ${res.status}: ${await res.text()}`);
  const p = (await res.json()).places?.[0];
  const hit = p ? { name: p.displayName?.text ?? query, lat: p.location.latitude, lng: p.location.longitude } : null;
  if (placeCache.size > 500) placeCache.clear();
  placeCache.set(key, hit);
  return hit;
}
