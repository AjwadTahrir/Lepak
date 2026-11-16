import { CalendarX2, CloudOff } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';
import StateMessage from '../ui/StateMessage.jsx';
import EventCard, { EventCardSkeleton } from '../cards/EventCard.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { getEvents } from '../../lib/mockApi.js';

const SHOW = 3;

// Phones: a sideways rail that bleeds to the screen edge, with the next card peeking in so it
// reads as scrollable. From sm up: a normal grid.
const RAIL = 'scrollbar-none relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 ' +
  'sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3';
const ITEM = 'w-[16.5rem] shrink-0 snap-start sm:w-auto';

export default function EventsSection({ filters, areaId, onClear }) {
  const { loading, data, error, retry } = useAsync(
    () => getEvents({ free: filters.free, when: filters.when }),
    `${areaId}|${filters.free}|${filters.when}`,
  );
  const filtered = filters.free || filters.when;

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
          body="Check your connection, then try again." action="Try again" onAction={retry} />
      )}

      {data?.length === 0 && (filtered ? (
        <StateMessage icon={CalendarX2} title="Tak jumpa yang ngam."
          body="No events match those filters. Let's try something else." action="Clear filters" onAction={onClear} />
      ) : (
        <StateMessage icon={CalendarX2} title="Nothing happening nearby yet."
          body="Maybe check another day, or try another area." />
      ))}

      {data?.length > 0 && (
        <ul className={RAIL} aria-label="Upcoming events, scroll sideways for more">
          {data.slice(0, SHOW).map((e) => <li key={e.id} className={ITEM}><EventCard event={e} stacked /></li>)}
        </ul>
      )}
    </section>
  );
}
