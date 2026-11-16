import { RestaurantResults } from './ResultSections.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { getNearbyRestaurants } from '../../lib/data.js';

// Browsing: fetches ranked restaurants around the current location
export default function NearbySection({ coords }) {
  const { loading, data, error, retry } = useAsync(
    () => getNearbyRestaurants({ lat: coords.lat, lng: coords.lng }),
    `${coords.lat},${coords.lng}`,
  );

  return (
    <RestaurantResults loading={loading} data={data} error={error} onRetry={retry}
      empty={{ title: 'Hmm, kawasan ni quiet sikit.', body: 'Try expanding your distance, or pick another area from the top.' }} />
  );
}
