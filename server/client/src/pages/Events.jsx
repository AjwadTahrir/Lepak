import { CalendarX2, CloudOff } from 'lucide-react';
import EventCard, { EventCardSkeleton } from '../components/cards/EventCard.jsx';
import StateMessage from '../components/ui/StateMessage.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getEvents } from '../lib/mockApi.js';
import { useLocationContext } from '../context/LocationContext.jsx';

// First version: everything in the next two weeks. Filters and the submit flow come in later tasks.
export default function Events() {
  const { place } = useLocationContext();
  const { loading, data, error, retry } = useAsync(() => getEvents(), place.id);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em]">Events</h1>
      <p className="mt-1 text-muted">What's on around {place.label} in the next two weeks.</p>

      <section aria-label="Upcoming events" aria-busy={loading} className="mt-6">
        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }, (_, i) => <EventCardSkeleton key={i} />)}
          </div>
        )}
        {error && <StateMessage tone="error" icon={CloudOff} title="Couldn't load events."
          body="Check your connection, then try again." action="Try again" onAction={retry} />}
        {data?.length === 0 && <StateMessage icon={CalendarX2} title="Nothing happening nearby yet."
          body="Maybe check another day, or try another area." />}
        {data?.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((e) => <li key={e.id} className="grid"><EventCard event={e} /></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
