import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { extractEventFromPoster } from '../services/gemini.js';

const router = Router();

const CATEGORIES = ['music', 'food', 'sports', 'campus', 'market', 'arts', 'other'];

function km(aLat, aLng, bLat, bLng) {
  const r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 +
            Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const when = (iso) =>
  new Intl.DateTimeFormat('en-MY', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    timeZone: 'Asia/Kuala_Lumpur',
  }).format(new Date(iso));

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

// ---------- Logged-in users: submit an event (goes to pending) ----------
router.post('/', requireAuth, async (req, res) => {
  const b = req.body ?? {};
  const title = String(b.title ?? '').trim();
  const starts = new Date(b.starts_at);

  if (title.length < 3 || title.length > 120) return res.status(400).json({ error: 'Title must be 3-120 characters' });
  if (Number.isNaN(starts.getTime())) return res.status(400).json({ error: 'Valid starts_at required' });
  if (starts < new Date()) return res.status(400).json({ error: 'Event must be in the future' });
  if (b.category && !CATEGORIES.includes(b.category)) return res.status(400).json({ error: 'Invalid category' });

  const row = {
    title,
    description: b.description?.toString().slice(0, 2000) ?? null,
    category: b.category ?? 'other',
    starts_at: starts.toISOString(),
    ends_at: b.ends_at ? new Date(b.ends_at).toISOString() : null,
    venue_name: b.venue_name ?? null,
    address: b.address ?? null,
    lat: typeof b.lat === 'number' ? b.lat : null,
    lng: typeof b.lng === 'number' ? b.lng : null,
    is_free: !!b.is_free,
    price_text: b.price_text ?? null,
    poster_url: b.poster_url ?? null,
    source_url: b.source_url ?? null,
    source: 'user',
    status: 'pending',          // always pending, never trust the client
    submitted_by: req.user.id,
  };

  const { data, error } = await supabase.from('events').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ---------- Admin: review queue ----------
router.get('/admin/pending', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('events').select('*')
    .eq('status', 'pending').order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

async function setStatus(req, res, status) {
  const { data, error } = await supabase.from('events').update({ status })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

router.post('/admin/:id/approve', requireAuth, requireAdmin, (req, res) => setStatus(req, res, 'approved'));
router.post('/admin/:id/reject',  requireAuth, requireAdmin, (req, res) => setStatus(req, res, 'rejected'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },          // 5 MB
  fileFilter: (req, file, cb) =>
    cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

// Gemini free tier is limited, so cap each user
const extractLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  keyGenerator: (req) => req.user.id,
  message: { error: 'Too many uploads, try again in an hour' },
});

router.post('/extract', requireAuth, extractLimiter, upload.single('poster'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Upload a JPG, PNG or WebP poster (max 5 MB)' });
  try {
    const draft = await extractEventFromPoster(req.file.buffer, req.file.mimetype);
    res.json({ draft });     // a draft only: nothing is saved yet
  } catch (e) {
    res.status(502).json({ error: 'Could not read the poster, try a clearer image', detail: e.message });
  }
});

export default router;