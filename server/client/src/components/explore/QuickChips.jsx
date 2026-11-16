import { CalendarDays, Moon, Shuffle, Ticket, UtensilsCrossed } from 'lucide-react';

// Makan / Event choose what to show (neither or both = everything).
// Free / Tonight narrow events. Surprise Me is an action, not a filter, so it has no pressed state.
const CHIPS = [
  { id: 'food', label: 'Makan', icon: UtensilsCrossed },
  { id: 'event', label: 'Event', icon: CalendarDays },
  { id: 'surprise', label: 'Surprise Me', icon: Shuffle, action: true },
  { id: 'free', label: 'Free', icon: Ticket },
  { id: 'tonight', label: 'Tonight', icon: Moon },
];

// Rendered inside the sticky filter bar; the bar provides the edge-to-edge bleed.
export default function QuickChips({ filters, onToggle, onSurprise }) {
  const pressed = { food: filters.food, event: filters.event, free: filters.free, tonight: filters.when === 'tonight' };

  return (
    <div role="group" aria-label="Quick filters" className="scrollbar-none overflow-x-auto px-4">
      <ul className="flex w-max gap-2">
        {CHIPS.map(({ id, label, icon: Icon, action }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => (action ? onSurprise() : onToggle(id))}
              aria-pressed={action ? undefined : pressed[id]}
              className={`flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold whitespace-nowrap transition-colors
                ${action
                  ? 'border-orange bg-orange-soft text-ink hover:bg-orange'
                  : pressed[id]
                    ? 'border-ink bg-ink text-cream'
                    : 'border-line bg-surface text-ink hover:border-ink'}`}
            >
              <Icon aria-hidden="true" className={`size-4 ${action ? 'text-orange-ink' : ''}`} />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
