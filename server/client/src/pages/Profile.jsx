import { User } from 'lucide-react';

// Placeholder until authentication (Supabase email sign-in) is built
export default function Profile() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em]">Profile</h1>
      <div className="mt-6 flex items-start gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-green-soft text-green">
          <User className="size-6" />
        </span>
        <div>
          <p className="font-display text-lg font-bold">Sign in is coming soon</p>
          <p className="mt-1 text-muted">
            You can browse and save without an account. Signing in will keep your saved spots across devices
            and let you submit events.
          </p>
        </div>
      </div>
    </div>
  );
}
