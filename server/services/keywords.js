// server/services/keywords.js
export const SEED_QUERIES = [
  // Tier 1 — event type + city (start here)
  'konsert kl', 'concert kl', 'gig kl', 'live music kl',
  'club night kl', 'rave kl',
  'pop up market kl', 'pasar malam kl', 'bazar kl',
  'food festival kl', 'festival makanan kl',
  'art exhibition kl', 'pameran seni kl',
  'screening kl', 'workshop kl',
  'open mic kl', 'trivia night kl',
  // Venue-leaning (verify each returns results before trusting)
  'zepp kl', 'rexkl', 'klpac', 'gasket alley',
];

export const ORGANIZER_HANDLES = [
  // Add real handles you trust. Verify each returns threads before adding.
];

const NEGATIVE =
  /presave|pre-save|digital download|merch drop|spotify|apple music|new single|album out|stream now/i;

export function isLikelyEventPost(post) {
  if (!post?.text || post.text.length < 15) return false;
  if (NEGATIVE.test(post.text)) return false;
  if (post.publishedAt) {
    const ageDays = (Date.now() - new Date(post.publishedAt).getTime()) / 86400000;
    if (ageDays > 60) return false;
  }
  return true;
}