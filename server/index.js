import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from './lib/supabase.js';
import { requireAuth } from './middleware/auth.js';
import restaurantsRouter from './routes/restaurants.js';
import eventsRouter from './routes/events.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use('/api/events', eventsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/health/db', async (req, res) => {
  const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' });
  res.json({ ok: !error, error: error?.message });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', req.user.id).single();
  res.json(data);
});

app.use('/api/restaurants', restaurantsRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Lepak API on :${port}`));