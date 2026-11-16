import { useCallback, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import AskBox from '../components/explore/AskBox.jsx';
import QuickChips from '../components/explore/QuickChips.jsx';
import SurpriseHero from '../components/explore/SurpriseHero.jsx';
import SurpriseSheet from '../components/explore/SurpriseSheet.jsx';
import AskSummary from '../components/explore/AskSummary.jsx';
import NightOutCard from '../components/explore/NightOutCard.jsx';
import NearbySection from '../components/explore/NearbySection.jsx';
import EventsSection from '../components/explore/EventsSection.jsx';
import { EventResults, RestaurantResults } from '../components/explore/ResultSections.jsx';
import Toast from '../components/ui/Toast.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';
import { useSurprise } from '../hooks/useSurprise.js';
import { useStuck } from '../hooks/useStuck.js';
import { USING_MOCK, ask as askApi } from '../lib/data.js';
import { mapsUrl } from '../lib/places.js';

// Browse filters behind the chips
const NO_FILTERS = { food: false, event: false, free: false, when: null };

// The chips reflect how an ask was read, so tapping one continues from there
const fromInterpreted = (i) => ({
  food: i.intent === 'food',
  event: i.intent === 'event',
  free: i.freeOnly,
  when: i.when === 'tonight' ? 'tonight' : null,
});

function applyToggle(f, id) {
  if (id === 'food' || id === 'event') return { ...f, [id]: !f[id] };
  // Free and Tonight are about events, so turning one on brings events into view
  const next = id === 'free' ? { ...f, free: !f.free } : { ...f, when: f.when === 'tonight' ? null : 'tonight' };
  const turnedOn = id === 'free' ? next.free : next.when === 'tonight';
  if (turnedOn && f.food && !f.event) next.event = true;
  return next;
}

export default function Explore() {
  const { place } = useLocationContext();
  const coords = { lat: place.lat, lng: place.lng };
  const coordKey = `${place.lat},${place.lng}`;

  const [filters, setFilters] = useState(NO_FILTERS);
  // An ask: { message, coordKey, loading?, data?, error? }. Belongs to the location it was asked from.
  const [asked, setAsked] = useState(null);
  const askRun = useRef(0);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [toast, setToast] = useState('');
  const surprise = useSurprise();
  const summaryRef = useRef(null);
  const [chipSentinel, chipsStuck] = useStuck(64);     // header is 64px tall

  const askActive = asked && asked.coordKey === coordKey;
  const interpreted = askActive ? asked.data?.interpreted : null;
  const chipState = interpreted ? fromInterpreted(interpreted) : filters;

  async function ask(message) {
    const id = ++askRun.current;
    setAsked({ message, coordKey, loading: true });
    // Move to the results so keyboard and screen-reader users land there too
    requestAnimationFrame(() => {
      summaryRef.current?.querySelector('h2')?.focus({ preventScroll: true });
      summaryRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    try {
      const data = await askApi({ message, ...coords });
      if (id === askRun.current) setAsked({ message, coordKey, data });
    } catch (error) {
      if (id === askRun.current) setAsked({ message, coordKey, error });
    }
  }

  const clear = useCallback(() => {
    askRun.current++;
    setFilters(NO_FILTERS);
    setAsked(null);
  }, []);

  function toggle(id) {
    setFilters(applyToggle(chipState, id));
    askRun.current++;
    setAsked(null);
  }

  function openSurprise() {
    setSurpriseOpen(true);
    surprise.roll(coords);
  }

  function closeSurprise() {
    setSurpriseOpen(false);
    surprise.reset();
  }

  // Mock mode only: there's no real place to open
  function go(pick) {
    closeSurprise();
    setToast(`${pick.name} is sample data, so there's no map for it.`);
  }

  const clearToast = useCallback(() => setToast(''), []);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Surprise Me leads: most people opening Lepak don't know what they want yet.
          Asking is the second way in, right under it. */}
      <div className="pt-4 lg:pt-8">
        <SurpriseHero onSurprise={openSurprise} areaLabel={place.label} />
        <div className="mt-4 lg:mt-5">
          <AskBox onAsk={ask} busy={askActive && asked.loading} />
        </div>
      </div>

      {/* Sticky filter bar: the chips stay in reach while you scroll the results they control */}
      <div ref={chipSentinel} aria-hidden="true" />
      <div className={`sticky top-16 z-20 -mx-4 mt-1 bg-cream py-2.5 transition-shadow duration-200
        ${chipsStuck ? 'shadow-[0_1px_0_var(--color-line),0_8px_16px_-12px_rgb(40_43_37/0.25)]' : ''}`}>
        <QuickChips filters={chipState} onToggle={toggle} onSurprise={openSurprise} />
      </div>

      <div ref={summaryRef} className="scroll-mt-32">
        {askActive && (
          <div className="mt-4">
            <AskSummary id="ask-summary" message={asked.message} state={asked} live={!USING_MOCK}
              onClear={clear} onRetry={() => ask(asked.message)} />
          </div>
        )}
      </div>

      {askActive ? <AskResults asked={asked} live={!USING_MOCK} /> : (
        <>
          {(filters.food || !filters.event) && <NearbySection coords={coords} />}
          {(filters.event || !filters.food) && <EventsSection coords={coords} filters={filters} onClear={clear} />}
        </>
      )}

      {USING_MOCK && (
        <p className="mt-2 flex items-start gap-2 border-t border-line pt-4 font-mono text-xs text-muted">
          <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          Sample data: these places and events are made up for the prototype.
        </p>
      )}

      <SurpriseSheet open={surpriseOpen} onClose={closeSurprise} surprise={surprise} onGo={go}
        goHref={USING_MOCK ? undefined : mapsUrl} />
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}

// Results of one ask. While loading the intent isn't known yet, so both sections show skeletons.
function AskResults({ asked, live }) {
  if (asked.error) return null;                 // AskSummary shows the error and Try again
  const { loading, data } = asked;
  const intent = data?.interpreted.intent ?? 'both';

  return (
    <>
      {data?.night_out && <NightOutCard nightOut={data.night_out} live={live} />}
      {intent !== 'event' && (
        <RestaurantResults loading={loading} data={data?.restaurants}
          empty={{ title: 'Hmm, kawasan ni quiet sikit.', body: 'Nothing nearby matched that. Try asking for something else, or a wider area.' }} />
      )}
      {intent !== 'food' && (
        <EventResults loading={loading} data={data?.events}
          empty={{ title: 'Tak jumpa yang ngam.', body: 'No events match that yet. Maybe try another day?' }} />
      )}
    </>
  );
}
