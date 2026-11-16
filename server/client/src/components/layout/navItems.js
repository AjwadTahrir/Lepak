import { Bookmark, CalendarDays, Compass, User } from 'lucide-react';

// Main destinations. Surprise Me is deliberately not here: it lives on Explore.
export const NAV_ITEMS = [
  { to: '/', label: 'Explore', icon: Compass, end: true },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/saved', label: 'Saved', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
];
