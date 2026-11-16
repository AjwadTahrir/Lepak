// Mock data layer for working without the server (VITE_USE_MOCK=true).
// Same function names and result shapes as liveApi.js.
//
// Test states from the URL:  ?demo=error  (requests fail)   ?demo=empty  (no results)
import { restaurants } from '../data/mock/restaurants.js';
import { getMockEvents } from '../data/mock/events.js';
import { filterByWhen } from './eventFilters.js';
import { demoInterpret } from './demoInterpret.js';

const demoMode = () => new URLSearchParams(window.location.search).get('demo');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function respond(data, ms = 550) {
  await wait(ms);
  if (demoMode() === 'error') throw new Error('Network error (demo)');
  if (demoMode() === 'empty') return Array.isArray(data) ? [] : null;
  return data;
}

// Same idea as the server: rating weighted by review count, minus distance
const score = (r) => ((r.rating_count * (r.rating ?? 0) + 25 * 3.5) / (r.rating_count + 25)) * 2 - r.distance_km;

const rankPlaces = ({ maxPrice = null, cuisine = null } = {}) => restaurants
  .filter((r) => maxPrice == null || r.price == null || r.price <= maxPrice)
  .filter((r) => !cuisine || r.cuisine === cuisine)
  .toSorted((a, b) => score(b) - score(a));

const findEvents = ({ free = false, when = null } = {}) =>
  filterByWhen(getMockEvents().filter((e) => !free || e.is_free), when);

export const getNearbyRestaurants = (opts) => respond(rankPlaces(opts));

export const getEvents = (opts) => respond(findEvents(opts));

// Random pick among the well-rated places, never the one just shown
export function getSurprise({ excludeId } = {}) {
  const pool = restaurants.filter((r) => r.place_id !== excludeId && (r.rating ?? 4) >= 4);
  return respond(pool[Math.floor(Math.random() * pool.length)] ?? null, 300);
}

export async function ask({ message }) {
  const interpreted = demoInterpret(message);
  const places = interpreted.intent === 'event' ? [] : rankPlaces(interpreted);
  const events = interpreted.intent === 'food' ? [] : findEvents({ free: interpreted.freeOnly, when: interpreted.when });
  const night_out = interpreted.intent === 'both' && events[0] && places[0]
    ? { event: events[0], restaurant: { ...places[0], distance_km: 0.4 } } : null;

  const data = await respond({ interpreted, restaurants: places.slice(0, 20), events: events.slice(0, 5), night_out }, 800);
  return data ?? { interpreted, restaurants: [], events: [], night_out: null };
}
