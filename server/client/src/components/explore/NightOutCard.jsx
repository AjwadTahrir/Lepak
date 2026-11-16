import { Clock, MapPin } from 'lucide-react';
import { cuisineStyle } from '../cards/cuisine.js';
import { CATEGORY_ICON } from '../cards/eventCategories.js';
import { distanceLabel, whenLabel } from '../../lib/format.js';
import { mapsUrl } from '../../lib/places.js';

// "Makan dulu, lepas tu..." The server pairs the soonest event with a good place near it.
// Numbered because it really is a sequence: eat first, then go.
export default function NightOutCard({ nightOut, live }) {
  const { event, restaurant } = nightOut;
  const { icon: Icon, tile } = cuisineStyle(restaurant.cuisine);
  const EventIcon = CATEGORY_ICON[event.category] ?? CATEGORY_ICON.other;

  return (
    <section aria-labelledby="nightout-title" className="mt-4 rounded-card border-2 border-ink bg-surface p-4 shadow-[4px_4px_0_var(--color-mango)]">
      <h2 id="nightout-title" className="text-lg leading-tight font-extrabold">Your night out, sorted</h2>
      <p className="text-sm text-muted">Makan dulu, then head over.</p>

      <ol className="mt-3 space-y-3">
        <li className="flex gap-3">
          <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${tile}`}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted">1. Makan</p>
            <p className="font-bold">
              {live
                ? <a href={mapsUrl(restaurant)} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{restaurant.name}</a>
                : restaurant.name}
            </p>
            <p className="text-sm text-muted">{restaurant.category}</p>
            {restaurant.distance_km != null && (
              <p className="font-mono text-xs">{distanceLabel(restaurant.distance_km)} from the event</p>
            )}
          </div>
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-orange text-ink">
            <EventIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted">2. Then</p>
            <p className="font-bold">{event.title}</p>
            <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
              <span className="flex items-center gap-1"><Clock aria-hidden="true" className="size-3.5" />
                <time dateTime={event.starts_at}>{whenLabel(event.starts_at)}</time></span>
              {event.venue_name && <span className="flex items-center gap-1"><MapPin aria-hidden="true" className="size-3.5" />{event.venue_name}</span>}
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
}
