// server/services/eventStore.js
import { supabase } from '../lib/supabase.js';

// Insert lead drafts as NEW pending events. Never updates an existing row: a link that's
// already in events (a user submission, an approved event, an earlier lead) is skipped,
// so a lead can't overwrite something a person wrote or reviewed.
export async function insertLeads(rows) {
  const byUrl = new Map(rows.filter((r) => r.source_url).map((r) => [r.source_url, r]));
  if (!byUrl.size) return { inserted: 0, duplicates: 0, rows: [] };

  const { data: existing, error: readErr } = await supabase
    .from('events').select('source_url').in('source_url', [...byUrl.keys()]);
  if (readErr) throw new Error(`events lookup: ${readErr.message}`);
  for (const { source_url } of existing ?? []) byUrl.delete(source_url);

  const fresh = [...byUrl.values()];
  if (!fresh.length) return { inserted: 0, duplicates: rows.length, rows: [] };

  const { data, error } = await supabase.from('events').insert(fresh).select();
  if (error) throw new Error(`events insert: ${error.message}`);
  return { inserted: data.length, duplicates: rows.length - data.length, rows: data };
}

// lead_seen remembers every post already sent to the model, so later runs skip it
// and don't pay for the same extraction twice.
export async function filterUnseen(posts) {
  const urls = posts.map((p) => p.url).filter(Boolean);
  if (!urls.length) return posts;
  const { data, error } = await supabase.from('lead_seen').select('permalink').in('permalink', urls);
  if (error) throw new Error(`lead_seen read: ${error.message}`);
  const seen = new Set((data ?? []).map((r) => r.permalink));
  return posts.filter((p) => p.url && !seen.has(p.url));
}

export async function markSeen(entries) {
  if (!entries.length) return;
  const { error } = await supabase.from('lead_seen')
    .upsert(entries, { onConflict: 'permalink', ignoreDuplicates: true });
  if (error) console.error('lead_seen write:', error.message);   // a lost mark only costs a re-check
}

export async function listUpcomingEvents({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}
