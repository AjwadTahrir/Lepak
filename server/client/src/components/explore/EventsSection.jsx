import { CalendarX2, CloudOff } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';
import StateMessage from '../ui/StateMessage.jsx';
import EventCard, { EventCardSkeleton } from '../cards/EventCard.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { getEvents } from '../../lib/mockApi.js';

const SHOW = 3;

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SHOW }, (_, i) => <EventCardSkeleton key={i} />)}
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
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, SHOW).map((e) => <li key={e.id} className="grid"><EventCard event={e} /></li>)}
        </ul>
      )}
    </section>
  );
}
