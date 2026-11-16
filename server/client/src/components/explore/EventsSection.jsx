import { EventResults } from './ResultSections.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { getEvents } from '../../lib/data.js';

// Browsing: fetches upcoming events around the current location, narrowed by the Free / Tonight chips
export default function EventsSection({ coords, filters, onClear }) {
  const { loading, data, error, retry } = useAsync(
    () => getEvents({ lat: coords.lat, lng: coords.lng, free: filters.free, when: filters.when }),
    `${coords.lat},${coords.lng}|${filters.free}|${filters.when}`,
  );
  const filtered = filters.free || filters.when;

  return (
    <EventResults loading={loading} data={data} error={error} onRetry={retry}
      empty={filtered
        ? { title: 'Tak jumpa yang ngam.', body: "No events match those filters. Let's try something else.", action: 'Clear filters', onAction: onClear }
        : { title: 'Nothing happening nearby yet.', body: 'Maybe check another day, or try another area.' }} />
  );
}
