import { Router } from 'express';
import { getNearbyPlaces } from '../services/places.js';

const router = Router();

const PRICE = { PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
                PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 };
const PRICE_LABEL = ['Free', '$', '$$', '$$$', '$$$$'];

function km(aLat, aLng, bLat, bLng) {
  const r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 +
            Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export async function discover(query) {
  const lat = parseFloat(query.lat), lng = parseFloat(query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) throw Object.assign(new Error('lat and lng required'), { status: 400 });

  const radius = Math.min(parseInt(query.radius) || 2000, 5000);
  const maxPrice = query.maxPrice != null ? parseInt(query.maxPrice) : null;
  const minRating = parseFloat(query.minRating) || 0;

  const places = await getNearbyPlaces({ lat, lng, radius, cuisine: query.cuisine });

  return places
    .map((p) => {
      const dist = km(lat, lng, p.lat, p.lng);
      const price = PRICE[p.price_level] ?? null;
      const rating = p.rating ?? 0;
      const m = 50, C = 4.0, v = p.rating_count ?? 0;
      const weighted = (v / (v + m)) * rating + (m / (v + m)) * C;
      return { ...p, distance_km: +dist.toFixed(2), price, score: weighted * 2 - dist };
      return { ...p, distance_km: +dist.toFixed(2), price, score: rating * 2 - dist };
    })
    .filter((p) => p.distance_km * 1000 <= radius)
    .filter((p) => p.rating == null || p.rating >= minRating)
    .filter((p) => maxPrice == null || p.price == null || p.price <= maxPrice)
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      ...p,
      reason: [p.rating ? `${p.rating}★` : null, p.price != null ? PRICE_LABEL[p.price] : null,
               `${p.distance_km} km away`].filter(Boolean).join(' · '),
    }));
}

export async function findEvents({ lat, lng, radiusKm = 10, from = new Date(),
                                   to = new Date(Date.now() + 14 * 864e5), category, free }) {
  let q = supabase.from('events').select('*')
    .eq('status', 'approved')
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .order('starts_at');
  if (CATEGORIES.includes(category)) q = q.eq('category', category);
  if (free) q = q.eq('is_free', true);

  const { data, error } = await q;
  if (error) throw new Error(error.message);

  return data
    .map((e) => ({ ...e, distance_km: e.lat != null ? +km(lat, lng, e.lat, e.lng).toFixed(2) : null }))
    .filter((e) => e.distance_km == null || e.distance_km <= radiusKm)
    .map((e) => ({
      ...e,
      reason: [when(e.starts_at), e.is_free ? 'Free' : e.price_text,
               e.distance_km != null ? `${e.distance_km} km away` : null].filter(Boolean).join(' · '),
    }));
}

router.get('/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ error: 'lat and lng required' });

  const days = Math.min(parseInt(req.query.days) || 14, 90);
  try {
    res.json(await findEvents({
      lat, lng,
      radiusKm: Math.min(parseFloat(req.query.radiusKm) || 10, 50),
      to: new Date(Date.now() + days * 864e5),
      category: req.query.category,
      free: req.query.free === 'true',
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/surprise', async (req, res) => {
  try {
    const list = (await discover(req.query)).slice(0, 10);   // random among the top 10
    if (!list.length) return res.status(404).json({ error: 'No matches, try a wider radius' });
    res.json(list[Math.floor(Math.random() * list.length)]);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

export default router;