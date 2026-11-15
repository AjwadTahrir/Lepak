// Date ranges for phrases like "this weekend", computed in Malaysia time (UTC+8, no DST)
const H = 3600e3, DAY = 24 * H;

export function rangeFor(when) {
  const now = Date.now();
  const kl = new Date(now + 8 * H);
  const midnight = Date.UTC(kl.getUTCFullYear(), kl.getUTCMonth(), kl.getUTCDate()) - 8 * H;
  const dow = kl.getUTCDay();                       // 0 = Sun ... 6 = Sat

  let from = now, to = now + 14 * DAY;              // default window
  switch (when) {
    case 'today':      to = midnight + DAY; break;
    case 'tonight':    from = Math.max(now, midnight + 17 * H); to = midnight + DAY; break;
    case 'tomorrow':   from = midnight + DAY; to = midnight + 2 * DAY; break;
    case 'this_weekend': {
      if (dow === 6) to = midnight + 2 * DAY;       // Saturday: rest of Sat + Sun
      else if (dow === 0) to = midnight + DAY;      // Sunday: rest of Sunday
      else { from = midnight + ((6 - dow) * DAY); to = from + 2 * DAY; }
      break;
    }
    case 'this_week':  to = now + 7 * DAY; break;
    case 'this_month': to = now + 30 * DAY; break;
  }
  return { from: new Date(from), to: new Date(to) };
}