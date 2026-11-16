import { useState } from 'react';
import { GraduationCap, Music, PartyPopper, Store, UtensilsCrossed } from 'lucide-react';
import { dateBadge } from '../../lib/format.js';

// No poster? Each category gets a pattern from its own world instead of a blank box:
// a pasar malam awning, a vinyl record, ruled exercise-book paper, a tablecloth of dots.
const ART = {
  market: {
    icon: Store,
    className: 'bg-mango-soft text-ink',
    style: {
      backgroundImage:
        'radial-gradient(circle at 12px 0, var(--color-orange) 11px, transparent 12px),' +
        'repeating-linear-gradient(90deg, var(--color-orange) 0 24px, var(--color-surface) 24px 48px)',
      backgroundSize: '24px 24px, 100% 46%',
      backgroundPosition: '0 46%, 0 0',
      backgroundRepeat: 'repeat-x, no-repeat',
    },
  },
  music: {
    icon: Music,
    className: 'bg-mango text-ink',
    style: {
      backgroundImage: 'repeating-radial-gradient(circle at 85% 30%, transparent 0 9px, rgb(40 43 37 / .16) 9px 11px)',
    },
  },
  campus: {
    icon: GraduationCap,
    className: 'bg-surface text-green',
    style: {
      backgroundImage:
        'linear-gradient(90deg, transparent 22px, var(--color-orange) 22px 24px, transparent 24px),' +
        'repeating-linear-gradient(0deg, transparent 0 15px, rgb(55 107 84 / .28) 15px 16px)',
    },
  },
  food: {
    icon: UtensilsCrossed,
    className: 'bg-orange-soft text-orange-ink',
    style: {
      backgroundImage: 'radial-gradient(var(--color-orange) 2.5px, transparent 3px)',
      backgroundSize: '16px 16px',
    },
  },
};

const OTHER = {
  icon: PartyPopper,
  className: 'bg-green-soft text-green',
  style: { backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 12px, rgb(55 107 84 / .18) 12px 14px)' },
};

export default function EventArt({ event, className = '' }) {
  const [posterFailed, setPosterFailed] = useState(false);
  const art = ART[event.category] ?? OTHER;
  const Icon = art.icon;
  const badge = dateBadge(event.starts_at);
  const showPoster = event.poster_url && !posterFailed;

  return (
    <div className={`relative overflow-hidden ${showPoster ? 'bg-ink' : art.className} ${className}`} style={showPoster ? undefined : art.style}>
      {showPoster ? (
        <img
          src={event.poster_url}
          alt={`Poster for ${event.title}`}
          loading="lazy"
          onError={() => setPosterFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full bg-surface shadow-card">
          <Icon className="size-[1.125rem]" />
        </span>
      )}
      {/* Date stub, like a ticket. Real date is in the card text, so hide this from screen readers */}
      <span aria-hidden="true" className="absolute bottom-2 left-2 flex w-12 flex-col items-center rounded-[10px] bg-surface py-1 font-mono leading-none text-ink shadow-card">
        <span className="text-[0.625rem]">{badge.top}</span>
        <span className="text-lg font-bold">{badge.bottom}</span>
      </span>
    </div>
  );
}
