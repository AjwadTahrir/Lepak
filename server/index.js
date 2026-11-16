import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { supabase } from './lib/supabase.js';
import { requireAuth } from './middleware/auth.js';
import restaurantsRouter from './routes/restaurants.js';
import eventsRouter from './routes/events.js';
import discoveryRouter from './routes/discovery.js';

// Fail fast instead of running half-configured (e.g. CORS silently falling back to '*')
const REQUIRED = ['CLIENT_ORIGIN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY', 'GOOGLE_PLACES_API_KEY'];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

// Render/Railway sit behind one proxy; without this every user shares the proxy's IP for rate limits
app.set('trust proxy', 1);

app.use(helmet());
// Comma-separated, e.g. "http://localhost:5173,https://lepak.vercel.app"
app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use('/api/events', eventsRouter);
app.use('/api/discovery', discoveryRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/health/db', async (req, res) => {
  const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' });
  if (error) console.error('health/db:', error.message);
  res.status(error ? 503 : 200).json({ ok: !error });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
  res.json(data);
});

app.use('/api/restaurants', restaurantsRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 forwards thrown/rejected errors here. Always JSON; never leak internals on 5xx.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : 'Invalid upload';
    return res.status(400).json({ error: msg });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });

  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error(`${req.method} ${req.originalUrl}:`, err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong, try again' : err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Lepak API on :${port}`));
