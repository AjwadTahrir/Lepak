import { Bookmark } from 'lucide-react';
import { useSaved } from '../../context/SavedContext.jsx';

export default function SaveButton({ kind, id, item, name, className = '' }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(kind, id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggle(kind, id, item)}
      className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors
        ${saved ? 'text-orange-ink' : 'text-muted hover:bg-cream hover:text-ink'} ${className}`}
    >
      <Bookmark aria-hidden="true" className={`size-5 ${saved ? 'fill-orange' : ''}`} />
      <span className="sr-only">Save {name}</span>
    </button>
  );
}
