import { useCallback, useEffect, useRef, useState } from 'react';
import { getSurprise } from '../lib/data.js';

const ROLL_MS = 900;          // anticipation: long enough to feel like a pick, short enough not to wait
const TICK_MS = 80;
// What flashes past while shuffling. Kinds of food, not real place names, so it never implies a result.
const TICKER = ['Nasi lemak', 'Mamak', 'Ramen', 'Kopi', 'Ikan bakar', 'Char kuey teow', 'Roti canai', 'Sushi', 'Laksa', 'Burger'];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// phase: idle | rolling | shown | empty | error
export function useSurprise() {
  const [state, setState] = useState({ phase: 'idle', pick: null, ticker: '' });
  const ticker = useRef(null);
  const lastId = useRef(null);
  const coords = useRef(null);
  const run = useRef(0);

  const stopTicker = () => clearInterval(ticker.current);
  useEffect(() => stopTicker, []);

  // Pass { lat, lng } on the first roll; rerolls reuse them
  const roll = useCallback(async (at) => {
    if (at) coords.current = at;
    const id = ++run.current;
    const reduce = prefersReducedMotion();
    let i = Math.floor(Math.random() * TICKER.length);

    stopTicker();
    setState((s) => ({ ...s, phase: 'rolling', ticker: TICKER[i] }));
    if (!reduce) {
      ticker.current = setInterval(() => {
        i = (i + 1) % TICKER.length;
        setState((s) => ({ ...s, ticker: TICKER[i] }));
      }, TICK_MS);
    }

    try {
      const [pick] = await Promise.all([
        getSurprise({ ...coords.current, excludeId: lastId.current }),
        new Promise((r) => setTimeout(r, reduce ? 0 : ROLL_MS)),
      ]);
      if (id !== run.current) return;               // a newer roll started
      stopTicker();
      lastId.current = pick?.place_id ?? null;
      setState({ phase: pick ? 'shown' : 'empty', pick, ticker: '' });
    } catch {
      if (id !== run.current) return;
      stopTicker();
      setState({ phase: 'error', pick: null, ticker: '' });
    }
  }, []);

  const reset = useCallback(() => {
    run.current++;
    stopTicker();
    setState({ phase: 'idle', pick: null, ticker: '' });
  }, []);

  return { ...state, roll, reset };
}
