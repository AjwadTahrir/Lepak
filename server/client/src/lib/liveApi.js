// Real backend. Same function names and result shapes as mockApi.js.
import { api } from './api.js';
import { normalizePlace } from './places.js';
import { filterByWhen } from './eventFilters.js';

export async function getNearbyRestaurants({ lat, lng, maxPrice, cuisine } = {}) {
  const list = await api('/api/restaurants/nearby', { query: { lat, lng, maxPrice, cuisine } });
  return list.map(normalizePlace);
}

// /nearby only knows "the next N days", so Tonight / This weekend are narrowed here
export async function getEvents({ lat, lng, free = false, when = null, days = 14 } = {}) {
  const list = await api('/api/events/nearby', { query: { lat, lng, days, free: free ? 'true' : null } });
  return filterByWhen(list, when);
}

// The server picks at random from its top 10. Try a couple of times to avoid showing the same place twice.
export async function getSurprise({ lat, lng, excludeId } = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pick = await api('/api/restaurants/surprise', { query: { lat, lng } });
      if (pick.place_id !== excludeId || attempt === 2) return normalizePlace(pick);
    } catch (e) {
      if (e.status === 404) return null;          // nothing nearby
      throw e;
    }
  }
  return null;
}

export async function ask({ message, lat, lng }) {
  const r = await api('/api/discovery/ask', { method: 'POST', body: { message, lat, lng } });
  return {
    ...r,
    restaurants: r.restaurants.map(normalizePlace),
    night_out: r.night_out && { ...r.night_out, restaurant: normalizePlace(r.night_out.restaurant) },
  };
}
