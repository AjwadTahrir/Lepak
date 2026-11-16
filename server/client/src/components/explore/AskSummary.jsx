import { X } from 'lucide-react';

// Shows how Lepak read the request, so a wrong guess is easy to spot and clear.
function describe(f) {
  const both = f.food === f.event;
  const food = f.maxPrice === 1 ? 'cheap food' : 'food';
  const events = [f.free && 'free', 'events', f.when === 'tonight' && 'tonight', f.when === 'weekend' && 'this weekend']
    .filter(Boolean).join(' ');
  if (both) return `${food[0].toUpperCase()}${food.slice(1)} and ${events}`;
  return f.food ? `${food[0].toUpperCase()}${food.slice(1)}` : `${events[0].toUpperCase()}${events.slice(1)}`;
}

export default function AskSummary({ id, message, filters, onClear }) {
  return (
    <div className="flex items-start gap-3 rounded-card bg-mango-soft p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted">“{message}”</p>
        <h2 id={id} tabIndex={-1} className="mt-0.5 text-lg font-bold outline-none">{describe(filters)}</h2>
        <p className="mt-1 font-mono text-xs text-muted">Demo: matched by keywords. The AI isn't connected yet.</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="-mt-1 -mr-1 flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold hover:bg-mango"
      >
        <X aria-hidden="true" className="size-4" />
        Clear
      </button>
    </div>
  );
}
