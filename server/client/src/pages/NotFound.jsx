import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-16 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em]">Sesat ni. This page doesn't exist.</h1>
      <Link to="/" className="mt-6 inline-flex min-h-12 items-center rounded-button bg-orange px-5 font-bold text-ink hover:bg-orange-hover">
        Back to Explore
      </Link>
    </div>
  );
}
