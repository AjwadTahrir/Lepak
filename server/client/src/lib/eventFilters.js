import { isThisWeekend, isTonight } from './format.js';

const TZ = 'Asia/Kuala_Lumpur';
const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);

// `when` uses the server's values (services/interpret.js WHENS) plus 'weekend' as an alias
export function matchesWhen(iso, when) {
  const d = new Date(iso);
  const days = (d - Date.now()) / 864e5;
  switch (when) {
    case 'tonight': return isTonight(iso);
    case 'today': return dayKey(d) === dayKey(new Date());
    case 'tomorrow': return dayKey(d) === dayKey(new Date(Date.now() + 864e5));
    case 'weekend':
    case 'this_weekend': return isThisWeekend(iso);
    case 'this_week': return days < 7;
    case 'this_month': return days < 30;
    default: return true;
  }
}

export const filterByWhen = (events, when) => (when ? events.filter((e) => matchesWhen(e.starts_at, when)) : events);
