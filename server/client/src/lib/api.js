import { supabase } from './supabase.js';

// '' in dev (Vite proxies /api), the deployed API origin in production
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// JSON fetch with the user's Supabase token attached when signed in.
// Errors come back as ApiError with the server's { error } message.
export async function api(path, { method = 'GET', query, body, signal } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v != null && v !== '' && v !== false) url.searchParams.set(k, String(v));
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
  } catch {
    throw new ApiError("Can't reach Lepak right now", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status);
  return data;
}
