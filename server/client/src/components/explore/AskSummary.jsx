import { Loader2, X } from 'lucide-react';

const CUISINE = {
  malay: 'Malay', chinese: 'Chinese', indian: 'Indian', thai: 'Thai', japanese: 'Japanese',
  korean: 'Korean', western: 'Western', seafood: 'seafood', cafe: 'cafe', fastfood: 'fast',
};
const WHEN = {
  today: 'today', tonight: 'tonight', tomorrow: 'tomorrow', this_weekend: 'this weekend',
  this_week: 'this week', this_month: 'this month',
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Builds "Cheap Japanese food and free events this weekend, within 2 km" from the server's reading
function describe(i) {
  if (i.fallback) return 'A bit of everything nearby';
  const food = [i.maxPrice === 1 && 'cheap',i.cuisine && CUISINE[i.cuisine], 'food'].filter(Boolean).join(' ');
  const events = [i.freeOnly && 'free', i.eventCategory && i.eventCategory !== 'other' && i.eventCategory, 'events', WHEN[i.when]]
    .filter(Boolean).join(' ');
  const what = i.intent === 'food' ? food : i.intent === 'event' ? events : `${food} and ${events}`;
  return cap(what) + (i.area ? ` in ${i.area}` : '') + (i.radiusKm ? `, within ${i.radiusKm} km` : '');
}

// Shows how Lepak read the request, so a wrong guess is easy to spot and clear
export default function AskSummary({ id, message, state, live, onClear, onRetry }) {
  const { loading, data, error } = state;
  let title, note;
  if (loading) title = 'Working out your plan...';
  else if (error) { title = "Couldn't work that out."; note = 'Check your connection, then try again.'; }
  else {
    title = describe(data.interpreted);
    if (data.interpreted.fallback) note = "Couldn't fully read that, so here's a bit of everything.";
    else if (data.interpreted.place && !data.interpreted.area) note = `Couldn't find "${data.interpreted.place}", so these are near you.`;
    else if (!live) note = "Demo: matched by keywords. The AI isn't connected yet.";
  }

  return (
    <div role={error ? 'alert' : undefined} className={`flex items-start gap-3 rounded-card p-4 ${error ? 'bg-orange-soft' : 'bg-mango-soft'}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted">“{message}”</p>
        <h2 id={id} tabIndex={-1} aria-live="polite" className="mt-0.5 flex items-center gap-2 text-lg font-bold outline-none">
          {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {title}
        </h2>
        {note && <p className="mt-1 font-mono text-xs text-muted">{note}</p>}
        {error && (
          <button type="button" onClick={onRetry}
            className="mt-3 min-h-11 rounded-button border-2 border-ink px-4 font-semibold hover:bg-ink hover:text-cream">
            Try again
          </button>
        )}
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
