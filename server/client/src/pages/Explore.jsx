import { useCallback, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import AskBox from '../components/explore/AskBox.jsx';
import QuickChips from '../components/explore/QuickChips.jsx';
import SurpriseCard from '../components/explore/SurpriseCard.jsx';
import SurpriseSheet from '../components/explore/SurpriseSheet.jsx';
import AskSummary from '../components/explore/AskSummary.jsx';
import NearbySection from '../components/explore/NearbySection.jsx';
import EventsSection from '../components/explore/EventsSection.jsx';
import Toast from '../components/ui/Toast.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';
import { useSurprise } from '../hooks/useSurprise.js';
import { useStuck } from '../hooks/useStuck.js';
import { demoInterpret } from '../lib/demoInterpret.js';

// Same shape the real POST /api/discovery/ask result will map onto
const NO_FILTERS = { food: false, event: false, free: false, when: null, maxPrice: null };

export default function Explore() {
  const { place } = useLocationContext();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [asked, setAsked] = useState(null);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [toast, setToast] = useState('');
  const surprise = useSurprise();
  const summaryRef = useRef(null);
  const [chipSentinel, chipsStuck] = useStuck(64);     // header is 64px tall

  // Makan or Event alone narrows the page; neither or both shows everything
  const showFood = filters.food || !filters.event;
  const showEvents = filters.event || !filters.food;
  const narrowed = filters.maxPrice != null;

  function toggle(id) {
    setFilters((f) => {
      if (id === 'food' || id === 'event') return { ...f, [id]: !f[id] };
      // Free and Tonight are about events, so turning one on brings events into view
      const next = id === 'free' ? { ...f, free: !f.free } : { ...f, when: f.when === 'tonight' ? null : 'tonight' };
      const turnedOn = id === 'free' ? next.free : next.when === 'tonight';
      if (turnedOn && f.food && !f.event) next.event = true;
      return next;
    });
  }

  function ask(message) {
    setFilters({ ...NO_FILTERS, ...demoInterpret(message) });
    setAsked(message);
    // Move to the results so keyboard and screen-reader users land there too
    requestAnimationFrame(() => {
      const el = summaryRef.current?.querySelector('h2');
      el?.focus({ preventScroll: true });
      summaryRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  const clear = useCallback(() => { setFilters(NO_FILTERS); setAsked(null); }, []);

  function openSurprise() {
    setSurpriseOpen(true);
    surprise.roll();
  }

  function closeSurprise() {
    setSurpriseOpen(false);
    surprise.reset();
  }

  function go(pick) {
    closeSurprise();
    setToast(`${pick.name} is demo data, so there's no map yet. Directions come with real places.`);
  }

  const clearToast = useCallback(() => setToast(''), []);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Compact app header area: the ask box should be within thumb reach on the first screen */}
      <section aria-labelledby="hero-title" className="pt-5 lg:pt-10">
        <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-orange-ink uppercase">Your next lepak starts here</p>
        <h1 id="hero-title" className="mt-1.5 text-[2rem] leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[2.75rem] lg:text-[3.25rem]">
          So, what's the plan?
        </h1>
        <p className="mt-1.5 text-muted">Good food, good places and good things happening around you.</p>

        {/* Phones: ask, then Surprise below the filters. Desktop: ask beside Surprise */}
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-6">
          <AskBox onAsk={ask} />
          <div className="hidden lg:block">
            <SurpriseCard onSurprise={openSurprise} />
          </div>
        </div>
      </section>

      {/* Sticky filter bar: the chips stay in reach while you scroll the results they control */}
      <div ref={chipSentinel} aria-hidden="true" />
      <div className={`sticky top-16 z-20 -mx-4 bg-cream py-2.5 transition-shadow duration-200
        ${chipsStuck ? 'shadow-[0_1px_0_var(--color-line),0_8px_16px_-12px_rgb(40_43_37/0.25)]' : ''}`}>
        <QuickChips filters={filters} onToggle={toggle} onSurprise={openSurprise} />
      </div>

      <div className="mt-1 lg:hidden">
        <SurpriseCard onSurprise={openSurprise} />
      </div>

      <div ref={summaryRef} className="scroll-mt-32">
        {asked && <div className="mt-4"><AskSummary id="ask-summary" message={asked} filters={filters} onClear={clear} /></div>}
      </div>

      {showFood && <NearbySection filters={filters} areaId={place.id} narrowed={narrowed} onClear={clear} />}
      {showEvents && <EventsSection filters={filters} areaId={place.id} onClear={clear} />}

      <p className="mt-2 flex items-start gap-2 border-t border-line pt-4 font-mono text-xs text-muted">
        <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        Prototype: these places and events are sample data, not real listings.
      </p>

      <SurpriseSheet open={surpriseOpen} onClose={closeSurprise} surprise={surprise} onGo={go} />
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
