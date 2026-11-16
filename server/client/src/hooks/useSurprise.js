import { useCallback, useEffect, useRef, useState } from 'react';
import { allRestaurantNames, getSurprise } from '../lib/mockApi.js';

const ROLL_MS = 900;          // anticipation: long enough to feel like a pick, short enough not to wait
const TICK_MS = 70;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// phase: idle | rolling | shown | empty | error
export function useSurprise() {
  const [state, setState] = useState({ phase: 'idle', pick: null, ticker: '' });
  const ticker = useRef(null);
  const lastId = useRef(null);
  const run = useRef(0);

  const stopTicker = () => clearInterval(ticker.current);
  useEffect(() => stopTicker, []);

  const roll = useCallback(async () => {
    const id = ++run.current;
    const reduce = prefersReducedMotion();
    const names = allRestaurantNames();
    let i = Math.floor(Math.random() * names.length);

    stopTicker();
    setState((s) => ({ ...s, phase: 'rolling', ticker: names[i] }));
    if (!reduce) {
      ticker.current = setInterval(() => {
        i = (i + 1) % names.length;
        setState((s) => ({ ...s, ticker: names[i] }));
      }, TICK_MS);
    }

    try {
      const [pick] = await Promise.all([
        getSurprise({ excludeId: lastId.current }),
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
