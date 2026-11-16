// server/services/threads.js
const THREADS_API_BASE = process.env.THREADS_SCRAPER_URL || 'http://localhost:8000';
// The scraper retries internally (up to 3 x 30s), so give up after 2 minutes
const TIMEOUT_MS = 120_000;

export async function getUserThreads(username) {
  const url = `${THREADS_API_BASE}/users/threads?user=${encodeURIComponent(username)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Threads scraper ${res.status}: ${await res.text()}`);
  return res.json();
}

// CONFIRMED: param is `query`, not `q`
export async function searchThreadsPosts(query, { mode = 'top' } = {}) {
  const params = new URLSearchParams({ query, mode });
  const url = `${THREADS_API_BASE}/search/posts?${params}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Threads search ${res.status}: ${await res.text()}`);
  return res.json();
}

export function flattenThread(thread) {
  const posts = Array.isArray(thread.posts) ? thread.posts : [];
  if (posts.length === 0) return null;
  const root = posts[0];
  const allText = posts.map((p) => p.text).filter(Boolean).join('\n\n');
  return {
    id: root.id,
    code: root.code,
    url: root.link,
    type: root.type,
    text: allText,
    language: root.language,
    publishedAt: root.published_at,
    stats: root.stats,
    author: {
      username: root.author?.username,
      fullName: root.author?.full_name,
      verified: root.author?.is_verified,
      profileUrl: root.author?.link,
    },
    mentions: (root.mentions || []).map((m) => ({ username: m.username, url: m.link })),
    links: (root.links || []).map((l) => ({ url: l.link, displayText: l.display_text })),
    media: root.media
      ? {
          type: root.media.type,
          image: root.media.image,
          video: root.media.video,
          items: root.media.items || [],
        }
      : null,
    isReply: root.is_reply,
  };
}

// Both /users/threads and /search/posts return { threads: [...] }
export function extractPosts(raw) {
  if (!raw || !Array.isArray(raw.threads)) return [];
  return raw.threads.map(flattenThread).filter(Boolean);
}