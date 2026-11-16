// MOCK MODE ONLY: keyword matching that stands in for Groq (POST /api/discovery/ask).
// Returns the same `interpreted` shape the server sends.
const has = (text, words) => words.some((w) => text.includes(w));

const CUISINE_WORDS = [
  ['cafe', ['kopi', 'coffee', 'cafe', 'latte']],
  ['japanese', ['ramen', 'sushi', 'japanese', 'jepun']],
  ['seafood', ['seafood', 'ikan', 'udang', 'ketam']],
  ['malay', ['nasi', 'malay', 'melayu']],
];

export function demoInterpret(message) {
  const t = message.toLowerCase();
  const food = has(t, ['makan', 'food', 'eat', 'lapar', 'minum', 'kopi', 'coffee', 'cafe', 'dinner', 'lunch', 'breakfast', 'sarapan']);
  const event = has(t, ['event', 'ada apa', 'buat apa', 'gig', 'concert', 'market', 'pasar', 'festival', 'jalan-jalan', 'hangout']);

  return {
    intent: food && !event ? 'food' : event && !food ? 'event' : 'both',
    cuisine: CUISINE_WORDS.find(([, words]) => has(t, words))?.[0] ?? null,
    maxPrice: has(t, ['murah', 'cheap', 'budget', 'jimat', 'student']) ? 1 : null,
    partySize: null,
    radiusKm: has(t, ['dekat', 'nearby', 'sini']) ? 2 : null,
    eventCategory: null,
    freeOnly: has(t, ['free', 'percuma']),
    when: has(t, ['tonight', 'malam ni', 'malam nanti']) ? 'tonight'
      : has(t, ['weekend', 'hujung minggu', 'sabtu', 'ahad']) ? 'this_weekend' : null,
  };
}
