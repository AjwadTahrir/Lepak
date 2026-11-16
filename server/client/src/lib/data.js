// Single entry point for screens. Live API by default; VITE_USE_MOCK=true in client/.env
// switches to the sample data (useful without the server running).
import * as live from './liveApi.js';
import * as mock from './mockApi.js';

export const USING_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const source = USING_MOCK ? mock : live;

export const getNearbyRestaurants = (opts) => source.getNearbyRestaurants(opts);
export const getEvents = (opts) => source.getEvents(opts);
export const getSurprise = (opts) => source.getSurprise(opts);
export const ask = (opts) => source.ask(opts);
