import { useEffect } from 'react';

// One short message above the bottom nav. Always rendered so screen readers hear updates.
export default function Toast({ message, onDone, ms = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [message, onDone, ms]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 lg:bottom-6"
    >
      {message && (
        <p className="max-w-md animate-pop rounded-button bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lift">{message}</p>
      )}
    </div>
  );
}
