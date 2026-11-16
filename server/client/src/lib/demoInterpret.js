// DEMO ONLY: keyword matching that stands in for POST /api/discovery/ask (Gemini on the server).
// Returns the same filter shape the Explore screen uses, so the real call can replace it.
const has = (text, words) => words.some((w) => text.includes(w));

export function demoInterpret(message) {
  const t = message.toLowerCase();
  const food = has(t, ['makan', 'food', 'eat', 'lapar', 'minum', 'kopi', 'coffee', 'cafe', 'dinner', 'lunch', 'breakfast', 'sarapan']);
  const event = has(t, ['event', 'ada apa', 'buat apa', 'gig', 'concert', 'market', 'pasar', 'festival', 'jalan-jalan', 'hangout']);

  return {
    food: food || !event,          // nothing recognised: show both
    event: event || !food,
    maxPrice: has(t, ['murah', 'cheap', 'budget', 'jimat', 'student']) ? 1 : null,
    free: has(t, ['free', 'percuma']),
    when: has(t, ['tonight', 'malam ni', 'malam nanti']) ? 'tonight'
      : has(t, ['weekend', 'hujung minggu', 'sabtu', 'ahad']) ? 'weekend' : null,
  };
}
