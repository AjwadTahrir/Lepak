// Turns a restaurant from the API (Google Places types) into what the cards need.

// First matching Google type wins: [type, cuisine key for the tile, label shown on the card]
const TYPES = [
  ['malaysian_restaurant', 'malay', 'Malaysian'],
  ['indonesian_restaurant', 'malay', 'Indonesian'],
  ['chinese_restaurant', 'chinese', 'Chinese'],
  ['indian_restaurant', 'indian', 'Indian'],
  ['japanese_restaurant', 'japanese', 'Japanese'],
  ['ramen_restaurant', 'japanese', 'Ramen'],
  ['sushi_restaurant', 'japanese', 'Sushi'],
  ['korean_restaurant', 'korean', 'Korean'],
  ['thai_restaurant', 'thai', 'Thai'],
  ['seafood_restaurant', 'seafood', 'Seafood'],
  ['fast_food_restaurant', 'fastfood', 'Fast food'],
  ['hamburger_restaurant', 'western', 'Burgers'],
  ['pizza_restaurant', 'western', 'Pizza'],
  ['steak_house', 'western', 'Steakhouse'],
  ['italian_restaurant', 'western', 'Italian'],
  ['american_restaurant', 'western', 'Western'],
  ['coffee_shop', 'cafe', 'Coffee'],
  ['cafe', 'cafe', 'Cafe'],
  ['bakery', 'bakery', 'Bakery'],
  ['dessert_shop', 'bakery', 'Desserts'],
  // Last so a specific cuisine wins: a food court tagged chinese_restaurant shows as Chinese
  ['food_court', null, 'Food court'],
  ['meal_takeaway', null, 'Takeaway'],
];

// The server's reason is currently built from stats ("4.6★ (212) · $ · 0.6 km away").
// The card already shows those, so a reason made only of stats is dropped.
const STAT = [/★/, /^\$+$/, /^Free$/, /km away( from the event)?$/, /^New, no reviews yet$/];

export function isStatsOnly(reason) {
  if (!reason) return true;
  return reason.split(' · ').every((part) => STAT.some((re) => re.test(part.trim())));
}

// Google names sometimes end with a company registration number, e.g. "Restoran ABC (AS0452224-V)"
// or "(1234567-X)". Useless to diners, so it's dropped for display.
const REG_NO = /\s*\((?:[A-Z]{1,3})?\d{5,}(?:-[A-Z0-9])?\)\s*$/;
export const cleanName = (name) => name?.replace(REG_NO, '').trim() || name;

export function normalizePlace(p) {
  if (!p) return p;
  const types = p.types ?? [];
  const match = TYPES.find(([t]) => types.includes(t));
  return {
    ...p,
    name: cleanName(p.name),
    cuisine: p.cuisine ?? match?.[1] ?? null,
    category: p.category ?? match?.[2] ?? 'Restaurant',
    reason: isStatsOnly(p.reason) ? null : p.reason,
  };
}

// Opens the place in Google Maps (works on phones with the Maps app too)
export function mapsUrl(p) {
  const q = encodeURIComponent(p.name);
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${encodeURIComponent(p.place_id)}`;
}
