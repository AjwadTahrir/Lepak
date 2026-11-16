import {
  Beef, CakeSlice, Coffee, CookingPot, Drumstick, EggFried, Fish, Flame, Salad, Sandwich, Soup, UtensilsCrossed,
} from 'lucide-react';

// Each cuisine gets an icon and a ground from the palette. With no photos,
// these tiles are what makes one card look different from the next.
// Keys come from lib/places.js (Google types) and the mock data.
const CUISINES = {
  cafe: { icon: Coffee, tile: 'bg-mango-soft text-ink' },
  bakery: { icon: CakeSlice, tile: 'bg-mango-soft text-orange-ink' },
  malay: { icon: EggFried, tile: 'bg-green-soft text-green' },
  mamak: { icon: CookingPot, tile: 'bg-orange-soft text-orange-ink' },
  indian: { icon: CookingPot, tile: 'bg-mango text-ink' },
  chinese: { icon: Flame, tile: 'bg-orange-soft text-orange-ink' },
  japanese: { icon: Soup, tile: 'bg-ink text-mango' },
  korean: { icon: Beef, tile: 'bg-ink text-orange' },
  thai: { icon: Salad, tile: 'bg-green-soft text-green' },
  seafood: { icon: Fish, tile: 'bg-green text-surface' },
  western: { icon: Sandwich, tile: 'bg-mango-soft text-ink' },
  fastfood: { icon: Drumstick, tile: 'bg-orange text-ink' },
};

const FALLBACK = { icon: UtensilsCrossed, tile: 'bg-cream text-ink' };

export const cuisineStyle = (cuisine) => CUISINES[cuisine] ?? FALLBACK;
