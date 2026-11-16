// Typographic logo: lowercase "lepak" with the full stop in Lepak Orange.
// The full stop is the brand: a plan, decided.
export default function Wordmark({ className = '' }) {
  return (
    <span className={`font-display text-[1.7rem] leading-none font-extrabold tracking-[-0.055em] text-ink ${className}`}>
      lepak<span className="text-orange">.</span>
    </span>
  );
}
