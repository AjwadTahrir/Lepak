// server/routes/threads.js
// Admin-only research routes. Mounted only when THREADS_SOURCE=scraper (see index.js).
import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getUserThreads,
  searchThreadsPosts,
  extractPosts,
} from '../services/threads.js';
import { postsToEvents } from '../services/events.js';
import { insertLeads, filterUnseen, markSeen } from '../services/eventStore.js';
import { SEED_QUERIES, isLikelyEventPost } from '../services/keywords.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);          // every route here costs quota or writes data

const MAX_EXTRACTIONS_PER_RUN = 30;

// Log the upstream detail, send a generic message
function fail(res, label, err) {
  console.error(`[threads] ${label}:`, err.message);
  res.status(502).json({ error: `${label} failed` });
}

// Extract, optionally save, and remember which posts were checked.
// Posts that hit the run cap or failed extraction are not marked, so a later run retries them.
async function runPipeline(posts, { save, discoveredVia, maxExtractions }) {
  const unseen = await filterUnseen(posts);
  const { events, skipped, calls } = await postsToEvents(unseen, { discoveredVia, maxExtractions });

  let saved = { inserted: 0, duplicates: 0 };
  if (save) {
    saved = await insertLeads(events.map((e) => e.row));
    const retry = new Set(['run cap reached', 'extraction failed']);
    await markSeen([
      ...events.map((e) => ({ permalink: e.row.source_url, is_event: true })),
      ...skipped.filter((s) => !retry.has(s.reason) && s.url).map((s) => ({ permalink: s.url, is_event: false })),
    ]);
  }
  return { unseen: unseen.length, calls, events, skipped, saved };
}

// --- Raw passthrough (debugging) ---
router.get('/users/:username', async (req, res) => {
  try {
    const raw = await getUserThreads(req.params.username);
    const posts = extractPosts(raw);
    res.json({ count: posts.length, posts });
  } catch (err) { fail(res, 'user fetch', err); }
});

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 200);
  if (!q) return res.status(400).json({ error: 'Missing ?q=' });
  try {
    const raw = await searchThreadsPosts(q, { mode: req.query.mode || 'top' });
    const posts = extractPosts(raw);
    res.json({ query: q, count: posts.length, posts });
  } catch (err) { fail(res, 'search', err); }
});

// --- Extraction, nothing saved ---
router.get('/users/:username/events/preview', async (req, res) => {
  try {
    const raw = await getUserThreads(req.params.username);
    const posts = extractPosts(raw).filter(isLikelyEventPost);
    const r = await runPipeline(posts, { save: false, maxExtractions: MAX_EXTRACTIONS_PER_RUN });
    res.json({ username: req.params.username, postCount: posts.length, ...r });
  } catch (err) { fail(res, 'preview', err); }
});

// --- Extraction + save as pending drafts ---
router.post('/users/:username/events/import', async (req, res) => {
  try {
    const raw = await getUserThreads(req.params.username);
    const posts = extractPosts(raw).filter(isLikelyEventPost);
    const r = await runPipeline(posts, { save: true, maxExtractions: MAX_EXTRACTIONS_PER_RUN });
    res.json({ username: req.params.username, extracted: r.events.length, ...r.saved, skipped: r.skipped });
  } catch (err) { fail(res, 'import', err); }
});

// --- Bulk keyword search + optional save. The extraction cap covers the whole run. ---
router.post('/search/import-bulk', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 5, SEED_QUERIES.length);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  const save = req.query.save === 'true';
  const seenPostIds = new Set();
  let budget = MAX_EXTRACTIONS_PER_RUN;
  const report = [];

  for (let i = 0; i < limit && budget > 0; i++) {
    const q = SEED_QUERIES[(offset + i) % SEED_QUERIES.length];
    try {
      const raw = await searchThreadsPosts(q, { mode: req.query.mode || 'top' });
      const posts = extractPosts(raw).filter(isLikelyEventPost);
      const fresh = posts.filter((p) => !seenPostIds.has(p.id) && seenPostIds.add(p.id));

      const r = await runPipeline(fresh, { save, discoveredVia: q, maxExtractions: budget });
      budget -= r.calls;
      report.push({
        query: q, posts: posts.length, fresh: fresh.length, unseen: r.unseen,
        events: r.events.length, inserted: r.saved.inserted,
        drafts: save ? undefined : r.events,         // dry run: show what would be saved
      });
    } catch (err) {
      console.error(`[threads] bulk "${q}":`, err.message);
      report.push({ query: q, error: 'failed' });
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  res.json({ save, report, totalPostsSeen: seenPostIds.size, extractionsLeft: budget });
});

export default router;
