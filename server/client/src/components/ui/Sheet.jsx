import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Bottom sheet on phones, centred dialog from sm up. Built on native <dialog>,
// so focus trapping, Esc to close and the inert background come from the browser.
export default function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click that lands on the <dialog> itself (not its content) is a backdrop click
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-0 mt-auto mb-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-[24px] bg-surface p-0 text-ink
                 shadow-lift backdrop:bg-ink/45 open:animate-pop sm:m-auto sm:w-[28rem] sm:rounded-card"
    >
      <div className="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pt-5">
        <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
