import { Shuffle } from 'lucide-react';

// The one loud thing on Explore: a single big tap target (thumb-friendly) instead of a poster
// with a small button. The fanned deck spreads on hover and settles on press.
export default function SurpriseCard({ onSurprise }) {
  return (
    <button
      type="button"
      onClick={onSurprise}
      aria-label="Surprise me: let Lepak pick a place for you"
      className="group relative isolate flex min-h-[7.5rem] w-full overflow-hidden rounded-card bg-orange p-4 pr-28 text-left text-ink
                 transition-transform active:scale-[.99] sm:p-5 sm:pr-32"
    >
      <span className="flex flex-col justify-center">
        <span className="font-display text-[1.375rem] leading-[1.1] font-extrabold tracking-[-0.025em]">
          No idea?<br />We got you.
        </span>
        <span className="mt-1 text-[0.9375rem] leading-snug font-medium">Let Lepak pick your next adventure.</span>
        <span className="mt-3 inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-bold text-cream">
          <Shuffle aria-hidden="true" className="size-4" />
          Surprise me
        </span>
      </span>

      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-5 -z-10 h-24 w-[4.5rem] -translate-y-1/2 sm:right-7">
        {[
          ['bg-green', 'translate-x-3 rotate-[16deg] group-hover:translate-x-5 group-hover:rotate-[24deg]'],
          ['bg-mango', 'translate-x-1 rotate-[5deg] group-hover:rotate-[9deg]'],
          ['bg-surface', '-rotate-[8deg] group-hover:-translate-x-1.5 group-hover:-rotate-[14deg]'],
        ].map(([bg, motion], i) => (
          <span key={i} className={`absolute inset-0 rounded-[12px] border-2 border-ink transition-transform duration-300 ${bg} ${motion}`} />
        ))}
        <span className="absolute inset-0 grid -rotate-[8deg] place-items-center font-display text-4xl font-extrabold
                         transition-transform duration-300 group-hover:-translate-x-1.5 group-hover:-rotate-[14deg]">
          ?
        </span>
      </span>
    </button>
  );
}
