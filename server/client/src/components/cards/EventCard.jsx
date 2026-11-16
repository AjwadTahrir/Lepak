import { Clock, MapPin } from 'lucide-react';
import EventArt from './EventArt.jsx';
import SaveButton from './SaveButton.jsx';
import { distanceLabel, whenLabel } from '../../lib/format.js';
import { CATEGORY_LABEL } from './eventCategories.js';

// Default: row on phones (art left, good for long lists), column from sm up.
// stacked: always a column (art on top), for carousels.
export default function EventCard({ event, stacked = false }) {
  return (
    <article className={`relative flex h-full overflow-hidden rounded-card border border-line bg-surface shadow-card ${stacked ? 'flex-col' : 'sm:flex-col'}`}>
      <EventArt event={event} className={stacked ? 'aspect-[16/9] w-full' : 'w-28 shrink-0 sm:aspect-[16/9] sm:w-full'} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-muted">{CATEGORY_LABEL[event.category] ?? 'Event'}</p>
            <h3 className="mt-0.5 text-[1.0625rem] leading-snug font-bold [overflow-wrap:anywhere]">{event.title}</h3>
          </div>
          <SaveButton kind="events" id={event.id} item={event} name={event.title} className="-mt-2 -mr-2" />
        </div>
        <p className="flex items-center gap-1.5 text-sm">
          <Clock aria-hidden="true" className="size-3.5 shrink-0 text-muted" />
          <time dateTime={event.starts_at}>{whenLabel(event.starts_at)}</time>
        </p>
        {(event.venue_name || event.distance_km != null) && (
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span className="min-w-0">
              {event.venue_name}
              {event.distance_km != null && (
                <span className={`font-mono whitespace-nowrap text-ink ${event.venue_name ? 'ml-2' : ''}`}>
                  {distanceLabel(event.distance_km)}
                </span>
              )}
            </span>
          </p>
        )}
        <div className="mt-auto pt-1">
          <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-xs font-bold
            ${event.is_free ? 'bg-green-soft text-green' : 'bg-mango-soft text-ink'}`}>
            {event.is_free ? 'Free' : event.price_text ?? 'Paid'}
          </span>
        </div>
      </div>
    </article>
  );
}

export function EventCardSkeleton({ stacked = false }) {
  return (
    <div aria-hidden="true" className={`flex h-full animate-shimmer overflow-hidden rounded-card border border-line bg-surface ${stacked ? 'flex-col' : 'sm:flex-col'}`}>
      <div className={`bg-line/70 ${stacked ? 'aspect-[16/9] w-full' : 'w-28 shrink-0 sm:aspect-[16/9] sm:w-full'}`} />
      <div className="flex-1 space-y-2.5 p-4">
        <div className="h-3 w-1/4 rounded bg-line/70" />
        <div className="h-4 w-3/4 rounded bg-line/70" />
        <div className="h-3 w-1/2 rounded bg-line/70" />
        <div className="h-5 w-14 rounded-full bg-line/70" />
      </div>
    </div>
  );
}
