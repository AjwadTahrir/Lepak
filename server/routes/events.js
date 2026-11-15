import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { extractEventFromPoster } from '../services/gemini.js';
import { km } from '../lib/geo.js';

const router = Router();

const CATEGORIES = ['music', 'food', 'sports', 'campus', 'market', 'arts', 'other'];


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
  res.json(await findEvents({
    lat, lng,
    radiusKm: Math.min(parseFloat(req.query.radiusKm) || 10, 50),
    to: new Date(Date.now() + days * 864e5),
    category: req.query.category,
    free: req.query.free === 'true',
  }));
});

// ---------- Logged-in users: submit an event (goes to pending) ----------
const bad = (msg) => Object.assign(new Error(msg), { status: 400 });

// Optional text field: null if empty, trimmed and capped otherwise
const text = (v, max) => {
  if (v == null || v === '') return null;
  if (typeof v !== 'string' && typeof v !== 'number') throw bad('Text fields must be strings');
  return String(v).trim().slice(0, max) || null;
};

// Only http(s), so a "javascript:" link can never reach the client
const link = (v, field) => {
  const s = text(v, 500);
  if (!s) return null;
  let u;
  try { u = new URL(s); } catch { throw bad(`${field} must be a valid URL`); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw bad(`${field} must be http(s)`);
  return u.href;
};

const submitLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, max: 20,
  keyGenerator: (req) => req.user.id,
  message: { error: 'Too many submissions today, try again tomorrow' },
});

router.post('/', requireAuth, submitLimiter, async (req, res) => {
  const b = req.body ?? {};
  const title = text(b.title, 200) ?? '';
  const starts = new Date(b.starts_at);

  if (title.length < 3 || title.length > 120) throw bad('Title must be 3-120 characters');
  if (b.starts_at == null || Number.isNaN(starts.getTime())) throw bad('Valid starts_at required');
  if (starts < new Date()) throw bad('Event must be in the future');
  if (starts > Date.now() + 365 * 864e5) throw bad('Event must be within the next year');
  if (b.category && !CATEGORIES.includes(b.category)) throw bad('Invalid category');

  let ends = null;
  if (b.ends_at) {
    ends = new Date(b.ends_at);
    if (Number.isNaN(ends.getTime())) throw bad('ends_at is not a valid date');
    if (ends < starts) throw bad('ends_at must be after starts_at');
  }

  // Both or neither, and on Earth
  const hasLat = b.lat != null, hasLng = b.lng != null;
  if (hasLat !== hasLng) throw bad('Send both lat and lng, or neither');
  if (hasLat && !(typeof b.lat === 'number' && Math.abs(b.lat) <= 90 &&
                  typeof b.lng === 'number' && Math.abs(b.lng) <= 180)) throw bad('Invalid lat/lng');

  const row = {
    title,
    description: text(b.description, 2000),
    category: b.category || 'other',
    starts_at: starts.toISOString(),
    ends_at: ends ? ends.toISOString() : null,
    venue_name: text(b.venue_name, 200),
    address: text(b.address, 300),
    lat: hasLat ? b.lat : null,
    lng: hasLng ? b.lng : null,
    is_free: b.is_free === true,
    price_text: text(b.price_text, 50),
    poster_url: link(b.poster_url, 'poster_url'),
    source_url: link(b.source_url, 'source_url'),
    source: 'user',
    status: 'pending',          // always pending, never trust the client
    submitted_by: req.user.id,
  };

  const { data, error } = await supabase.from('events').insert(row).select().single();
  if (error) throw new Error(`events insert: ${error.message}`);
  res.status(201).json(data);
});

// ---------- Admin: review queue ----------
router.get('/admin/pending', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('events').select('*')
    .eq('status', 'pending').order('created_at');
  if (error) throw new Error(`pending list: ${error.message}`);
  res.json(data);
});

// Only pending events can be reviewed, so a double-click or a stale tab can't flip
// an approved event to rejected (or re-approve a rejected one).
async function setStatus(req, res, status) {
  const { data, error } = await supabase.from('events').update({ status })
    .eq('id', req.params.id).eq('status', 'pending').select().maybeSingle();
  // 22P02 = malformed id (e.g. not a uuid): treat as not found
  if (error && error.code !== '22P02') throw new Error(`set status: ${error.message}`);
  if (!data) return res.status(404).json({ error: 'Event not found or already reviewed' });
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
    console.error('poster extract:', e.message);     // log the detail, don't send it
    res.status(502).json({ error: 'Could not read the poster, try a clearer image' });
  }
});

export default router;