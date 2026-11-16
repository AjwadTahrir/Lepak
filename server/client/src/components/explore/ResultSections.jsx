import { useState } from 'react';
import { CalendarX2, CloudOff, MapPinOff } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';
import StateMessage from '../ui/StateMessage.jsx';
import RestaurantCard, { RestaurantCardSkeleton } from '../cards/RestaurantCard.jsx';
import EventCard, { EventCardSkeleton } from '../cards/EventCard.jsx';

// Presentational sections: they render whatever state they're given, so the same UI serves
// browsing (each section fetches its own data) and an ask (one response feeds both).

const SHOW = 3;          // events rail + loading skeletons
const PAGE = 6;          // restaurants per "Show more"

export function RestaurantResults({ loading, data, error, onRetry, empty }) {
  // Extra pages belong to one result set: a new search starts back at PAGE
  const [more, setMore] = useState({ for: null, n: 0 });
  const extra = more.for === data ? more.n : 0;
  const count = PAGE + extra;

  return (
    <section aria-labelledby="nearby-title" aria-busy={loading} className="py-6">
      <SectionHeader id="nearby-title" title="Nearby lepak spots" subtitle="Some places worth checking out." />

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SHOW }, (_, i) => <RestaurantCardSkeleton key={i} />)}
        </div>
      )}
      {error && (
        <StateMessage tone="error" icon={CloudOff} title="Couldn't load nearby spots."
          body="Check your connection, then try again." action="Try again" onAction={onRetry} />
      )}
      {data?.length === 0 && <StateMessage icon={MapPinOff} {...empty} />}
      {data?.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, count).map((p) => <li key={p.place_id} className="grid"><RestaurantCard place={p} /></li>)}
        </ul>
      )}
      {data?.length > count && (
        <button type="button" onClick={() => setMore({ for: data, n: extra + PAGE })}
          className="mt-4 min-h-11 w-full rounded-button border-2 border-ink px-4 font-semibold hover:bg-ink hover:text-cream sm:w-auto">
          Show more ({data.length - count} left)
        </button>
      )}
    </section>
  );
}

// Phones: a sideways rail that bleeds to the screen edge, with the next card peeking in so it
// reads as scrollable. From sm up: a normal grid. `relative` keeps sr-only text inside the rail.
const RAIL = 'scrollbar-none relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 ' +
  'sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3';
const ITEM = 'w-[16.5rem] shrink-0 snap-start sm:w-auto';

export function EventResults({ loading, data, error, onRetry, empty }) {
  return (
    <section aria-labelledby="events-title" aria-busy={loading} className="py-6">
      <SectionHeader id="events-title" title="Something happening" subtitle="Your next weekend might be interesting."
        linkTo="/events" linkLabel="See all" />

      {loading && (
        <div className={RAIL}>
          {Array.from({ length: SHOW }, (_, i) => <div key={i} className={ITEM}><EventCardSkeleton stacked /></div>)}
        </div>
      )}
      {error && (
        <StateMessage tone="error" icon={CloudOff} title="Couldn't load events."
          body="Check your connection, then try again." action="Try again" onAction={onRetry} />
      )}
      {data?.length === 0 && <StateMessage icon={CalendarX2} {...empty} />}
      {data?.length > 0 && (
        <ul className={RAIL} aria-label="Upcoming events, scroll sideways for more">
          {data.slice(0, SHOW).map((e) => <li key={e.id} className={ITEM}><EventCard event={e} stacked /></li>)}
        </ul>
      )}
    </section>
  );
}
