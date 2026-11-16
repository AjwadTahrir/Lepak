import { Link } from 'react-router-dom';

export default function SectionHeader({ id, title, subtitle, linkTo, linkLabel }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-[1.375rem] leading-tight font-extrabold tracking-[-0.02em] sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-muted">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex min-h-11 shrink-0 items-center font-semibold text-orange-ink underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
