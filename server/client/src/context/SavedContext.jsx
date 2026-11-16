import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Prototype: saved items live in this browser only. Task 5 moves them to
// Supabase (saved_places / saved_events) for signed-in users.
const KEY = 'lepak:saved';
const SavedContext = createContext(null);

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return { places: raw?.places ?? {}, events: raw?.events ?? {} };
  } catch {
    return { places: {}, events: {} };
  }
}

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* private mode: keep in memory */ }
  }, [saved]);

  // kind: 'places' | 'events'. Stores the item itself so the Saved screen can render it.
  const toggle = useCallback((kind, id, item) => {
    setSaved((s) => {
      const next = { ...s[kind] };
      if (next[id]) delete next[id];
      else next[id] = item;
      return { ...s, [kind]: next };
    });
  }, []);

  const isSaved = useCallback((kind, id) => Boolean(saved[kind][id]), [saved]);

  const value = useMemo(() => ({ saved, toggle, isSaved }), [saved, toggle, isSaved]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used inside SavedProvider');
  return ctx;
}
