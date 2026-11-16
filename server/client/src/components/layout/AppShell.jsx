import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppShell() {
  // Each tab opens at the top instead of keeping the last page's scroll position
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-button bg-ink px-4 py-3 font-semibold text-cream focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="pb-nav outline-none lg:pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
