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
      <section aria-labelledby="hero-title" className="pt-6 pb-4 lg:pt-12 lg:pb-6">
        <p className="font-mono text-xs tracking-[0.08em] text-orange-ink uppercase">Your next lepak starts here</p>
        <h1 id="hero-title" className="mt-2 text-[2.625rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[4.5rem]">
          So, what's the plan?
        </h1>
        <p className="mt-3 max-w-[34ch] text-lg text-muted">
          Good food, good places and good things happening around you.
        </p>

        {/* Phones: ask, chips, then Surprise. Desktop: ask + chips beside Surprise */}
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="min-w-0">
            <AskBox onAsk={ask} />
            <div className="mt-4">
              <QuickChips filters={filters} onToggle={toggle} onSurprise={openSurprise} />
            </div>
          </div>
          <SurpriseCard onSurprise={openSurprise} />
        </div>
      </section>

      <div ref={summaryRef} className="scroll-mt-20">
        {asked && <AskSummary id="ask-summary" message={asked} filters={filters} onClear={clear} />}
      </div>

      <p className="mt-4 flex items-start gap-2 font-mono text-xs text-muted">
        <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        Prototype: these places and events are sample data, not real listings.
      </p>

      {showFood && <NearbySection filters={filters} areaId={place.id} narrowed={narrowed} onClear={clear} />}
      {showEvents && <EventsSection filters={filters} areaId={place.id} onClear={clear} />}

      <SurpriseSheet open={surpriseOpen} onClose={closeSurprise} surprise={surprise} onGo={go} />
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
