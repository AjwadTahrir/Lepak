import { cuisineStyle } from './cuisine.js';
import PlaceMeta from './PlaceMeta.jsx';
import SaveButton from './SaveButton.jsx';

export default function RestaurantCard({ place }) {
  const { icon: Icon, tile } = cuisineStyle(place.cuisine);
  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className={`grid size-14 shrink-0 place-items-center rounded-[14px] ${tile}`}>
          <Icon className="size-7" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[1.0625rem] leading-snug font-bold">{place.name}</h3>
          <p className="text-sm text-muted">{place.category}</p>
        </div>
        <SaveButton kind="places" id={place.place_id} item={place} name={place.name} className="-mt-1.5 -mr-1.5" />
      </div>
      {place.reason && <p className="text-[0.9375rem] leading-snug">{place.reason}</p>}
      <PlaceMeta place={place} className="mt-auto border-t border-line pt-3" />
    </article>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-shimmer flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="size-14 rounded-[14px] bg-line/70" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-line/70" />
          <div className="h-3 w-1/3 rounded bg-line/70" />
        </div>
      </div>
      <div className="h-3.5 w-11/12 rounded bg-line/70" />
      <div className="mt-1 h-3 w-1/2 rounded bg-line/70" />
    </div>
  );
}
