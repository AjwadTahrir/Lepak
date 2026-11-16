import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, MapPin, User } from 'lucide-react';
import Wordmark from './Wordmark.jsx';
import LocationSheet from './LocationSheet.jsx';
import { NAV_ITEMS } from './navItems.js';
import { useLocationContext } from '../../context/LocationContext.jsx';

export default function Header() {
  const { place } = useLocationContext();
  const [locOpen, setLocOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-cream">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4">
        <Link to="/" className="-ml-1 flex min-h-11 items-center px-1" aria-label="Lepak, go to Explore">
          <Wordmark />
        </Link>

        {/* Desktop navigation; phones use BottomNav */}
        <nav aria-label="Main" className="ml-6 hidden lg:block">
          <ul className="flex gap-1">
            {NAV_ITEMS.filter((i) => i.to !== '/profile').map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `flex h-11 items-center rounded-full px-4 font-medium
                    ${isActive ? 'bg-orange-soft text-orange-ink' : 'text-muted hover:text-ink'}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setLocOpen(true)}
          className="ml-auto flex h-11 max-w-[11rem] items-center gap-1.5 rounded-full border border-line bg-surface pr-3 pl-2.5
                     text-sm font-semibold hover:border-line-strong"
        >
          <MapPin aria-hidden="true" className="size-4 shrink-0 text-orange-ink" />
          <span className="sr-only">Location: </span>
          <span className="truncate">{place.label}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted" />
          <span className="sr-only">, change</span>
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) => `grid size-11 shrink-0 place-items-center rounded-full border
            ${isActive ? 'border-orange bg-orange-soft text-orange-ink' : 'border-line bg-surface text-ink hover:border-line-strong'}`}
        >
          <User aria-hidden="true" className="size-5" />
          <span className="sr-only">Profile</span>
        </NavLink>
      </div>

      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
    </header>
  );
}
