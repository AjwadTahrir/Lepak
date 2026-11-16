import { Shuffle } from 'lucide-react';

// The main character of Explore. The page question is its headline and the deck is the answer:
// one tap and Lepak picks. The button's ::after stretches over the whole block, so the entire
// orange area is the tap target while the h1 stays a real heading outside the button.
// The deck fans out on hover and settles on press.
export default function SurpriseHero({ onSurprise, areaLabel }) {
  const near = areaLabel && areaLabel !== 'Near you' ? `near ${areaLabel}` : 'near you';

  return (
    <section
      aria-labelledby="hero-title"
      className="group relative isolate overflow-hidden rounded-card bg-orange p-5 pr-[6.25rem] text-ink min-[360px]:pr-[8.5rem]
                 has-[button:active]:scale-[.99] motion-safe:transition-transform
                 sm:p-7 sm:pr-56 lg:p-10 lg:pr-80"
    >
      <h1 id="hero-title"
        className="text-[1.875rem] leading-[1.02] min-[360px]:text-[2.125rem] font-extrabold tracking-[-0.045em] text-balance sm:text-[3rem] lg:text-[4rem]">
        Lepak mane ni wey?
      </h1>
      <p className="mt-2 max-w-[26rem] text-[0.9375rem] leading-snug font-medium sm:text-[1.0625rem]">
        Tak tahu? Tap and Lepak picks a spot {near} for you.
      </p>

      <button
        type="button"
        onClick={onSurprise}
        className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full whitespace-nowrap bg-ink px-5 text-[1.0625rem] font-bold text-cream
                   after:absolute after:inset-0 after:content-[''] hover:bg-[color-mix(in_srgb,var(--color-ink)_88%,white)]
                   focus-visible:outline-offset-4 lg:min-h-14 lg:px-6 lg:text-lg"
      >
        <Shuffle aria-hidden="true" className="size-5" strokeWidth={2.5} />
        Surprise me
      </button>

      <Deck />
    </section>
  );
}

// Three cards, face-down except the top one. Sizes step up with the block.
function Deck() {
  const cards = [
    ['bg-green', 'translate-x-4 rotate-[14deg] group-hover:translate-x-7 group-hover:rotate-[22deg]'],
    ['bg-mango', 'translate-x-1.5 rotate-[4deg] group-hover:translate-x-2 group-hover:rotate-[8deg]'],
    ['bg-surface', '-rotate-[7deg] group-hover:-translate-x-2 group-hover:-rotate-[13deg]'],
  ];
  return (
    <span aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-5 -z-10 h-24 w-[4.5rem] -translate-y-1/2
                 min-[360px]:right-7 min-[360px]:h-32 min-[360px]:w-24
                 sm:right-14 sm:h-44 sm:w-32 lg:right-24 lg:h-56 lg:w-40">
      {cards.map(([bg, motion], i) => (
        <span key={i}
          className={`absolute inset-0 rounded-[14px] border-2 border-ink motion-safe:transition-transform motion-safe:duration-300
                      lg:rounded-[18px] ${bg} ${motion}`} />
      ))}
      <span className="absolute inset-0 grid -rotate-[7deg] place-items-center font-display text-4xl font-extrabold min-[360px]:text-5xl
                       motion-safe:transition-transform motion-safe:duration-300 group-hover:-translate-x-2 group-hover:-rotate-[13deg]
                       sm:text-6xl lg:text-7xl">
        ?
      </span>
    </span>
  );
}
