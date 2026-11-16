import { MapPin, Star } from 'lucide-react';
import { PRICE_WORDS, distanceLabel, ratingCountLabel } from '../../lib/format.js';

// Rating, price and distance as separate items. Each one is left out when the data is missing.
export default function PlaceMeta({ place, className = '' }) {
  const { rating, rating_count, price, distance_km } = place;
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.8rem] ${className}`}>
      {rating != null && (
        <li className="flex items-center gap-1">
          <Star aria-hidden="true" className="size-3.5 fill-mango text-mango" />
          <span className="sr-only">Rated </span>
          <span className="font-bold">{rating.toFixed(1)}</span>
          {rating_count > 0 && <span className="text-muted">({ratingCountLabel(rating_count)}<span className="sr-only"> reviews</span>)</span>}
        </li>
      )}
      <li>
        {price != null ? (
          <>
            <span aria-hidden="true">
              {'$'.repeat(Math.max(price, 1))}
              <span className="text-disabled">{'$'.repeat(4 - Math.max(price, 1))}</span>
            </span>
            <span className="sr-only">Price: {PRICE_WORDS[price]}</span>
          </>
        ) : (
          <span className="text-muted">Price unavailable</span>
        )}
      </li>
      {distance_km != null && (
        <li className="flex items-center gap-1">
          <MapPin aria-hidden="true" className="size-3.5 text-muted" />
          {distanceLabel(distance_km)}<span className="sr-only"> away</span>
        </li>
      )}
    </ul>
  );
}
