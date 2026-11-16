import { Coffee, CookingPot, EggFried, Fish, Soup, UtensilsCrossed } from 'lucide-react';

// Each cuisine gets an icon and a ground from the palette. With no photos,
// these tiles are what makes one card look different from the next.
const CUISINES = {
  cafe: { icon: Coffee, tile: 'bg-mango-soft text-ink' },
  malay: { icon: EggFried, tile: 'bg-green-soft text-green' },
  mamak: { icon: CookingPot, tile: 'bg-orange-soft text-orange-ink' },
  japanese: { icon: Soup, tile: 'bg-ink text-mango' },
  seafood: { icon: Fish, tile: 'bg-green text-surface' },
};

const FALLBACK = { icon: UtensilsCrossed, tile: 'bg-cream text-ink' };

export const cuisineStyle = (cuisine) => CUISINES[cuisine] ?? FALLBACK;
