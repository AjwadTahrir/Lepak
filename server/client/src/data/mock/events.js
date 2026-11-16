// DEMO DATA. Fictional events for the prototype, not real listings.
// Shape follows GET /api/events/nearby. Dates are generated relative to "now" (Malaysia time)
// so "Tonight" and "This weekend" always have something to show.

const H = 3600e3, DAY = 24 * H, MYT = 8 * H;

// Midnight today in Malaysia, as a UTC timestamp
function myMidnight(now = Date.now()) {
  const kl = new Date(now + MYT);
  return Date.UTC(kl.getUTCFullYear(), kl.getUTCMonth(), kl.getUTCDate()) - MYT;
}

function at(dayOffset, hour, minute = 0) {
  return new Date(myMidnight() + dayOffset * DAY + hour * H + minute * 60e3).toISOString();
}

// Days until the next Saturday / Sunday (0 if today is that day)
function daysUntil(dow) {
  const today = new Date(Date.now() + MYT).getUTCDay();
  return (dow - today + 7) % 7;
}

function tonight() {
  const hourNow = new Date(Date.now() + MYT).getUTCHours();
  return hourNow < 21 ? at(0, 21) : at(0, Math.min(hourNow + 1, 23), 30);
}

export function getMockEvents() {
  return [
    {
      id: 'demo-jamming',
      title: 'Jamming Malam Minggu',
      category: 'music',
      starts_at: tonight(),
      venue_name: 'The Backroom, Taman Pelangi',
      distance_km: 2.1,
      is_free: false,
      price_text: 'RM15',
      poster_url: '/mock/poster-jamming.svg',
    },
    {
      id: 'demo-pasar-karat',
      title: 'Pasar Karat Pagi Ahad',
      category: 'market',
      starts_at: at(daysUntil(0) || 7, 7),
      venue_name: 'Bandar Johor Bahru',
      distance_km: 1.5,
      is_free: true,
      price_text: null,
      poster_url: null,
    },
    {
      id: 'demo-festival-makan',
      title: 'Festival Makan Selatan',
      category: 'food',
      starts_at: at(daysUntil(6) || 7, 11),
      venue_name: 'Danga Bay',
      distance_km: 6.2,
      is_free: false,
      price_text: 'RM5 entry',
      poster_url: null,
    },
    {
      id: 'demo-malam-kampus',
      title: 'Malam Kebudayaan Kampus',
      category: 'campus',
      starts_at: at(3, 20),
      venue_name: 'Dewan Besar, Skudai',
      distance_km: 9.8,
      is_free: true,
      price_text: null,
      poster_url: null,
    },
  ].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
