import { CloudOff, MapPinOff } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader.jsx';
import StateMessage from '../ui/StateMessage.jsx';
import RestaurantCard, { RestaurantCardSkeleton } from '../cards/RestaurantCard.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { getNearbyRestaurants } from '../../lib/mockApi.js';

const SHOW = 3;

export default function NearbySection({ filters, areaId, narrowed, onClear }) {
  const { loading, data, error, retry } = useAsync(
    () => getNearbyRestaurants({ maxPrice: filters.maxPrice }),
    `${areaId}|${filters.maxPrice}`,
  );

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
          body="Check your connection, then try again." action="Try again" onAction={retry} />
      )}

      {data?.length === 0 && (
        <StateMessage icon={MapPinOff} title="Hmm, kawasan ni quiet sikit."
          body={narrowed ? 'Nothing matches all your filters here. Try loosening them?' : 'Try expanding your distance, or pick another area from the top.'}
          action={narrowed ? 'Clear filters' : undefined} onAction={onClear} />
      )}

      {data?.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, SHOW).map((p) => (
            <li key={p.place_id} className="grid"><RestaurantCard place={p} /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
