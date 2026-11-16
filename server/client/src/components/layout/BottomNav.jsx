import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems.js';

// Phones and tablets. From lg up the same links sit in the header.
export default function BottomNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-safe lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className="group flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.75rem]">
              {({ isActive }) => (
                <>
                  <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors
                    ${isActive ? 'bg-orange-soft text-orange-ink' : 'text-muted group-hover:text-ink'}`}>
                    <Icon aria-hidden="true" className="size-[1.35rem]" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span className={isActive ? 'font-semibold text-ink' : 'font-medium text-muted'}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
