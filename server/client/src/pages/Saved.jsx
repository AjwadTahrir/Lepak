import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import RestaurantCard from '../components/cards/RestaurantCard.jsx';
import EventCard from '../components/cards/EventCard.jsx';
import { useSaved } from '../context/SavedContext.jsx';

export default function Saved() {
  const { saved } = useSaved();
  const places = Object.values(saved.places);
  const events = Object.values(saved.events);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em]">Saved</h1>
      <p className="mt-1 text-muted">Saved on this device for now. Sign in comes later, so they follow you around.</p>

      {places.length === 0 && events.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-card border border-dashed border-line-strong/50 px-5 py-10 text-center">
          <span aria-hidden="true" className="mb-3 grid size-12 place-items-center rounded-full bg-mango-soft">
            <Bookmark className="size-6" />
          </span>
          <p className="font-display text-lg font-bold">Nothing saved yet.</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Tap the bookmark on any spot or event to keep it here for later.</p>
          <Link to="/" className="mt-4 flex min-h-11 items-center rounded-button bg-orange px-5 font-bold text-ink hover:bg-orange-hover">
            Find something
          </Link>
        </div>
      )}

      {places.length > 0 && (
        <section aria-labelledby="saved-places" className="mt-8">
          <h2 id="saved-places" className="mb-3 text-xl font-extrabold">Places</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => <li key={p.place_id} className="grid"><RestaurantCard place={p} /></li>)}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section aria-labelledby="saved-events" className="mt-8">
          <h2 id="saved-events" className="mb-3 text-xl font-extrabold">Events</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => <li key={e.id} className="grid"><EventCard event={e} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
