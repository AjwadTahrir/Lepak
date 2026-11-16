const TZ = 'Asia/Kuala_Lumpur';

// Price level 0-4 (server: restaurants.js PRICE) -> words people actually use
export const PRICE_WORDS = ['Free', 'Murah', 'Sederhana', 'Mahal sikit', 'Splurge'];

export function distanceLabel(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function ratingCountLabel(n) {
  if (!n) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
}

const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);

export function isTonight(iso) {
  const d = new Date(iso);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hour12: false }).format(d));
  return dayKey(d) === dayKey(new Date()) && hour >= 17;
}

export function isThisWeekend(iso) {
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short' }).format(d);
  const daysAway = (d - Date.now()) / 864e5;
  return (weekday === 'Sat' || weekday === 'Sun') && daysAway < 7;
}

const time = (d) =>
  new Intl.DateTimeFormat('en-MY', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(d);

// "Tonight, 9:00 pm" / "Tomorrow, 7:00 am" / "Sat 22 Nov, 11:00 am"
export function whenLabel(iso) {
  const d = new Date(iso);
  const today = dayKey(new Date());
  const tomorrow = dayKey(new Date(Date.now() + 864e5));
  if (dayKey(d) === today) return `${isTonight(iso) ? 'Tonight' : 'Today'}, ${time(d)}`;
  if (dayKey(d) === tomorrow) return `Tomorrow, ${time(d)}`;
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  return `${day}, ${time(d)}`;
}

// Short date for the event art badge: { top: 'SAT', bottom: '22' }
export function dateBadge(iso) {
  const d = new Date(iso);
  return {
    top: new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short' }).format(d).toUpperCase(),
    bottom: new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric' }).format(d),
  };
}
