import { Check, LocateFixed } from 'lucide-react';
import Sheet from '../ui/Sheet.jsx';
import { useLocationContext } from '../../context/LocationContext.jsx';
import { AREAS } from '../../data/areas.js';

const STATUS_COPY = {
  locating: 'Finding you...',
  denied: 'Location is blocked for this site. Allow it in your browser settings, or pick an area below.',
  unavailable: 'Couldn\'t get your location. Pick an area below instead.',
};

export default function LocationSheet({ open, onClose }) {
  const { place, status, chooseArea, locateMe } = useLocationContext();

  async function handleLocate() {
    if (await locateMe()) onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Where are you lepak-ing?">
      <button
        type="button"
        onClick={handleLocate}
        disabled={status === 'locating'}
        className="flex min-h-12 w-full items-center gap-3 rounded-button bg-green px-4 font-semibold text-surface
                   hover:bg-green/90 disabled:opacity-70"
      >
        <LocateFixed aria-hidden="true" className={`size-5 ${status === 'locating' ? 'animate-spin' : ''}`} />
        Use my location
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-muted">{STATUS_COPY[status] ?? ''}</p>

      <h3 className="mt-3 mb-2 font-mono text-xs text-muted">Or pick an area</h3>
      <ul className="divide-y divide-line overflow-hidden rounded-button border border-line">
        {AREAS.map((area) => {
          const current = place.id === area.id;
          return (
            <li key={area.id}>
              <button
                type="button"
                aria-current={current ? 'true' : undefined}
                onClick={() => { chooseArea(area); onClose(); }}
                className="flex min-h-12 w-full items-center justify-between px-4 text-left hover:bg-cream"
              >
                <span className={current ? 'font-semibold' : ''}>{area.label}</span>
                {current && <Check aria-hidden="true" className="size-5 text-orange-ink" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
