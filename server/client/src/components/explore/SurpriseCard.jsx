import { Shuffle } from 'lucide-react';

// The one loud thing on Explore. The fanned "deck" on the right spreads when you point at the button.
export default function SurpriseCard({ onSurprise }) {
  return (
    <section aria-labelledby="surprise-title" className="group relative isolate overflow-hidden rounded-card bg-orange p-5 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-3 -bottom-6 -z-10 h-36 w-32 sm:right-2">
        {[
          ['bg-green', 'translate-x-3 rotate-[18deg] group-has-[button:hover]:translate-x-5 group-has-[button:hover]:rotate-[26deg]'],
          ['bg-mango', 'translate-x-1 rotate-[5deg] group-has-[button:hover]:rotate-[9deg]'],
          ['bg-surface', '-rotate-[10deg] group-has-[button:hover]:-rotate-[18deg] group-has-[button:hover]:-translate-x-2'],
        ].map(([bg, motion], i) => (
          <span
            key={i}
            className={`absolute inset-0 origin-bottom rounded-[14px] border-2 border-ink transition-transform duration-300 ${bg} ${motion}`}
          />
        ))}
        <span className="absolute inset-0 grid -rotate-[10deg] place-items-center font-display text-6xl font-extrabold text-ink
                         transition-transform duration-300 group-has-[button:hover]:-translate-x-2 group-has-[button:hover]:-rotate-[18deg]">
          ?
        </span>
      </div>

      <h2 id="surprise-title" className="max-w-[12ch] text-[1.75rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-ink sm:text-[2rem]">
        No idea? We got you.
      </h2>
      <p className="mt-2 max-w-[20ch] font-medium text-ink">Let Lepak pick your next adventure.</p>
      <button
        type="button"
        onClick={onSurprise}
        className="mt-5 flex min-h-12 items-center gap-2 rounded-button bg-ink px-5 font-bold text-cream
                   hover:bg-ink/90 active:translate-y-px"
      >
        <Shuffle aria-hidden="true" className="size-[1.125rem]" />
        Surprise me
      </button>
    </section>
  );
}
