// Mock data layer. Every function returns a Promise like the real API will, so screens
// already handle loading, empty and error states. Swap these for lib/api.js calls later.
//
// Test states from the URL:  ?demo=error  (requests fail)   ?demo=empty  (no results)
import { restaurants } from '../data/mock/restaurants.js';
import { getMockEvents } from '../data/mock/events.js';
import { isThisWeekend, isTonight } from './format.js';

const demoMode = () => new URLSearchParams(window.location.search).get('demo');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function respond(data, ms = 550) {
  await wait(ms);
  if (demoMode() === 'error') throw new Error('Network error (demo)');
  return demoMode() === 'empty' ? (Array.isArray(data) ? [] : null) : data;
}

// Same idea as the server: rating weighted by review count, minus distance
const score = (r) => ((r.rating_count * (r.rating ?? 0) + 25 * 3.5) / (r.rating_count + 25)) * 2 - r.distance_km;

export function getNearbyRestaurants({ maxPrice = null } = {}) {
  const list = restaurants
    .filter((r) => maxPrice == null || r.price == null || r.price <= maxPrice)
    .toSorted((a, b) => score(b) - score(a));
  return respond(list);
}

export function getEvents({ free = false, when = null } = {}) {
  const list = getMockEvents()
    .filter((e) => !free || e.is_free)
    .filter((e) => when !== 'tonight' || isTonight(e.starts_at))
    .filter((e) => when !== 'weekend' || isThisWeekend(e.starts_at));
  return respond(list);
}

// Random pick among the top results, never the one just shown
export function getSurprise({ excludeId } = {}) {
  const pool = restaurants.filter((r) => r.place_id !== excludeId && (r.rating ?? 4) >= 4);
  return respond(pool[Math.floor(Math.random() * pool.length)] ?? null, 300);
}

export const allRestaurantNames = () => restaurants.map((r) => r.name);
