import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getNearbyPlaces } from '../services/places.js';
import { km } from '../lib/geo.js';

const router = Router();

// Cache misses call Google Places (billed), so cap per IP on top of the global limit
router.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 60, message: { error: 'Too many requests, try again in a few minutes' } }));

const PRICE = { PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
                PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 };
const PRICE_LABEL = ['Free', '$', '$$', '$$$', '$$$$'];

// Bayesian average: few reviews get pulled toward PRIOR. PRIOR is deliberately "meh" (3.5)
// so a place with 0-3 reviews can't outrank a well-reviewed 4.2. M = reviews needed to be trusted half-way.
const PRIOR = 3.5, M = 25;

export async function discover(query) {
  const lat = parseFloat(query.lat), lng = parseFloat(query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) throw Object.assign(new Error('lat and lng required'), { status: 400 });

  const radius = Math.min(parseInt(query.radius) || 2000, 5000);
  const maxPrice = query.maxPrice != null ? parseInt(query.maxPrice) : null;

  const places = await getNearbyPlaces({ lat, lng, radius, cuisine: query.cuisine, maxPrice });

  return places
    .map((p) => {
      const dist = km(lat, lng, p.lat, p.lng);
      const price = PRICE[p.price_level] ?? null;
      const v = p.rating != null ? p.rating_count ?? 0 : 0;     // unrated = no evidence
      const weighted = (v * (p.rating ?? 0) + M * PRIOR) / (v + M);
      return { ...p, distance_km: +dist.toFixed(2), price, score: weighted * 2 - dist };
    })
    .filter((p) => p.distance_km * 1000 <= radius)
    .filter((p) => maxPrice == null || Number.isNaN(maxPrice) || p.price == null || p.price <= maxPrice)
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      ...p,
      reason: [p.rating ? `${p.rating}★ (${p.rating_count})` : 'New, no reviews yet',
               p.price != null ? PRICE_LABEL[p.price] : null,
               `${p.distance_km} km away`].filter(Boolean).join(' · '),
    }));
}

// Ranked list. Query: lat, lng, radius (m, max 5000), cuisine, maxPrice.
// No rating cutoff: low-rated and unrated places still show, the Bayesian score just ranks them lower.
router.get('/nearby', async (req, res) => {
  res.json(await discover(req.query));
});

router.get('/surprise', async (req, res) => {
  const list = (await discover(req.query)).slice(0, 10);   // random among the top 10
  if (!list.length) return res.status(404).json({ error: 'No matches, try a wider radius' });
  res.json(list[Math.floor(Math.random() * list.length)]);
});

export default router;
