import { Shuffle } from 'lucide-react';
import Sheet from '../ui/Sheet.jsx';
import PlaceMeta from '../cards/PlaceMeta.jsx';
import { cuisineStyle } from '../cards/cuisine.js';

// surprise = useSurprise() state. Rolling cycles names for under a second, then reveals the pick.
// goHref(pick): a Maps link for real places; without it, onGo handles the tap (mock mode)
export default function SurpriseSheet({ open, onClose, surprise, onGo, goHref }) {
  const { phase, pick, ticker, roll } = surprise;

  return (
    <Sheet open={open} onClose={onClose} title="Lepak's pick">
      {/* Announce only the outcome, not every name flashing past */}
      <p aria-live="polite" className="sr-only">
        {phase === 'rolling' && 'Picking a place...'}
        {phase === 'shown' && pick && `Lepak picked ${pick.name}. ${pick.reason ?? ''}`}
      </p>

      {phase === 'rolling' && (
        <div aria-hidden="true" className="flex min-h-[17rem] flex-col items-center justify-center text-center">
          <span className="mb-4 grid size-16 animate-spin place-items-center rounded-[16px] bg-orange text-ink [animation-duration:900ms]">
            <Shuffle className="size-7" />
          </span>
          <p className="font-mono text-xs text-muted">Shuffling...</p>
          <p className="mt-1 h-9 truncate font-display text-2xl font-extrabold text-ink/40">{ticker}</p>
        </div>
      )}

      {phase === 'shown' && pick && <Reveal pick={pick} goHref={goHref?.(pick)} onGo={() => onGo(pick)} onReroll={() => roll()} />}

      {phase === 'empty' && (
        <Fallback title="Tak jumpa yang ngam." body="Nothing good nearby to pick from. Try another area?" action="Try again" onAction={() => roll()} />
      )}
      {phase === 'error' && (
        <Fallback title="Couldn't pick a place." body="Check your connection, then try again." action="Try again" onAction={() => roll()} />
      )}
    </Sheet>
  );
}

function Reveal({ pick, goHref, onGo, onReroll }) {
  const { icon: Icon, tile } = cuisineStyle(pick.cuisine);
  return (
    <div key={pick.place_id} className="animate-pop">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className={`grid size-20 shrink-0 -rotate-6 place-items-center rounded-[18px] border-2 border-ink ${tile}`}>
          <Icon className="size-10" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted">{pick.category}</p>
          <h3 className="text-[1.625rem] leading-tight font-extrabold tracking-[-0.02em]">{pick.name}</h3>
        </div>
      </div>
      {pick.reason && <p className="mt-4 text-[1.0625rem] leading-snug">{pick.reason}</p>}
      <PlaceMeta place={pick} className="mt-3 rounded-button bg-cream px-3 py-2.5" />

      <div className="mt-5 grid gap-2.5">
        {goHref ? (
          <a href={goHref} target="_blank" rel="noreferrer"
            className="grid min-h-12 place-items-center rounded-button bg-orange font-bold text-ink hover:bg-orange-hover active:translate-y-px">
            Let's go!<span className="sr-only"> (opens Google Maps)</span>
          </a>
        ) : (
          <button type="button" onClick={onGo} className="min-h-12 rounded-button bg-orange font-bold text-ink hover:bg-orange-hover active:translate-y-px">
            Let's go!
          </button>
        )}
        <button
          type="button"
          onClick={onReroll}
          className="flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink font-bold hover:bg-cream"
        >
          <Shuffle aria-hidden="true" className="size-4" />
          Not this one
        </button>
      </div>
    </div>
  );
}

function Fallback({ title, body, action, onAction }) {
  return (
    <div className="py-6 text-center">
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-1 text-muted">{body}</p>
      <button type="button" onClick={onAction} className="mt-5 min-h-12 w-full rounded-button bg-orange font-bold text-ink">
        {action}
      </button>
    </div>
  );
}
