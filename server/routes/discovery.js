import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { interpret } from '../services/interpret.js';
import { rangeFor } from '../services/dates.js';
import { discover } from './restaurants.js';
import { findEvents } from './events.js';

const router = Router();

// Gemini calls cost quota, so limit per IP
router.use(rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { error: 'Too many requests, try again later' } }));

router.post('/ask', async (req, res) => {
  const message = String(req.body?.message ?? '').trim().slice(0, 300);
  const lat = Number(req.body?.lat), lng = Number(req.body?.lng);
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'lat and lng required' });

  const f = await interpret(message);
  const { from, to } = rangeFor(f.when);

  // Errors go to the JSON error handler in index.js (Express 5 catches rejections)
  const [restaurants, events] = await Promise.all([
    f.intent === 'event' ? [] : discover({
      lat, lng, radius: (f.radiusKm ?? 2) * 1000,
      cuisine: f.cuisine, maxPrice: f.maxPrice, minRating: f.minRating,
    }),
    f.intent === 'food' ? [] : findEvents({
      lat, lng, radiusKm: f.radiusKm ?? 10, from, to,
      category: f.eventCategory, free: f.freeOnly,
    }),
  ]);

  res.json({
    interpreted: f,
    restaurants: restaurants.slice(0, 5),
    events: events.slice(0, 5),
    // For "both": pair the soonest event with the best nearby restaurant
    night_out: f.intent === 'both' && events[0] && restaurants[0]
      ? { event: events[0], restaurant: restaurants[0] } : null,
  });
});

export default router;