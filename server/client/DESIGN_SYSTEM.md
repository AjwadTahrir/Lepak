# Lepak Design System

Source of truth for every Lepak screen. Tokens live in `src/index.css` (`@theme`); components use
the Tailwind utilities those tokens generate. If something here and the code disagree, fix one of them.

## 1. Brand

- **Name:** Lepak (written `lepak.` as the wordmark)
- **Tagline:** Lepak mane weyh?
- **Job:** help people who don't know what they want yet make a plan: where to eat, what's on, or both.
  Google Maps is for people who already know where they're going. Lepak is for everyone else.
- **Audience:** university students, young working adults, groups of friends. Johor Bahru first.
- **Personality:** playful, warm, approachable, modern, a bit cheeky. Local without the clichés
  (no batik borders, no hibiscus, no "Malaysia Boleh").

## 2. Design principles

Lepak is a **product UI**, not a marketing site. Screens should feel like an app: compact headers,
content and controls on the first screen, controls within thumb reach, fast scanning.

0. **App, not landing page.** No poster-sized heroes or full-screen promo blocks. On a 390×844 phone the
   first screen shows the ask box, the filters, Surprise Me and the start of the results.
1. **Plans, not search results.** Lead with a question ("So, what's the plan?"), give a reason with
   every suggestion, and keep actions to the next step (save, go, pick another).
2. **One loud thing per screen.** On Explore it is the Surprise Me block. Everything else stays quiet.
3. **Typography and colour do the work.** No photos yet, so identity comes from type, flat colour
   and patterns from the subject's own world (awnings, vinyl, ruled paper).
4. **Honest data.** Missing rating or price is left out or labelled, never faked. Sample data is
   labelled as sample data. The AI is never claimed to be connected when it isn't.
5. **Thumb first.** Designed at 390px, checked at 320px, then widened. Every target is at least 44px.

## 3. Colour

| Token | Hex | Use |
|---|---|---|
| `orange` | `#F26B38` | Lepak Orange. Primary fills: main buttons, Surprise block, active pill. **Never as text on cream** (2.8:1) |
| `orange-hover` | `#E85F2C` | Hover/pressed fill for orange buttons |
| `orange-ink` | `#B8441A` | Orange for text and icons on cream/white (4.9:1): links, active nav icon, eyebrow |
| `orange-soft` | `#FDE7DC` | Tinted ground: active nav pill, mamak tile, food event art |
| `cream` | `#F8F4EA` | App background |
| `surface` | `#FFFDF8` | Cards, inputs, sheets, bottom nav |
| `green` | `#376B54` | Leaf Green. Secondary actions ("Use my location"), Free labels |
| `green-soft` | `#DDE9E1` | Free badge ground, Malay tile |
| `mango` | `#F4C95D` | Accent: rating stars, music art, highlights |
| `mango-soft` | `#FBEFCB` | Paid badge, ask summary, cafe tile, empty-state icons |
| `ink` | `#282B25` | Charcoal. Body text, text **on orange**, outlines, focus ring |
| `muted` | `#6B6A60` | Secondary text (5:1 on cream) |
| `line` | `#E4DCCB` | Hairlines, card borders, dividers, skeletons |
| `line-strong` | `#8C8371` | Hover borders, dashed empty-state borders |
| `disabled` | `#B7AF9E` | Unused price signs, disabled marks |

**Rules**
- Text on orange is always `ink` (4.7:1). White on orange fails AA (3.0:1).
- No gradients as decoration. No violet or purple anywhere.
- No raw hex values in components. Add a token first.

## 4. Typography

| Role | Family | Weights | Where |
|---|---|---|---|
| Display | Plus Jakarta Sans (variable) | 700, 800 | Wordmark, h1–h3, card titles, empty-state titles |
| Body | DM Sans (variable) | 400, 500, 600, 700 | Paragraphs, buttons, chips, nav labels |
| Data | Space Mono | 400, 700 | Ratings, prices, distances, dates, category labels, small notes |

Fonts are self-hosted through `@fontsource` (no Google Fonts request), so the PWA works offline.

| Style | Size / line height | Notes |
|---|---|---|
| Hero h1 | 42px → 60px (sm) → 72px (lg) / 1.02 | 800, tracking −0.045em |
| Page h1 | 36px | 800, tracking −0.04em |
| Section h2 | 22px → 24px | 800, tracking −0.02em |
| Card title h3 | 17px / snug | 700 |
| Body | 16–17px / 1.5 | 400 |
| Small | 14px | Supporting text, venue |
| Mono data | 12–13px | Always paired with an icon or a clear context |

- Sentence case everywhere. The one uppercase line is the hero eyebrow.
- `text-wrap: balance` on headings. Keep paragraphs under ~65 characters.

## 5. Spacing and layout

- 4px base (Tailwind scale). Common steps: 8, 12, 16, 24, 32, 48.
- Page gutter 16px (`px-4`); content max width `max-w-5xl` (1024px), left-aligned.
- Sections: 24px vertical padding (`py-6`), heading then 16px then content.
- Grids: 1 column on phones, 2 from `sm` (640px), 3 from `lg` (1024px). Gap 12px.
- Fixed bottom nav reserves space with `.pb-nav`. Safe areas are handled with `env(safe-area-inset-*)`.

## 6. Radius and elevation

| Token | Value | Use |
|---|---|---|
| `rounded-card` | 18px | Cards, Surprise block, empty states, desktop sheet |
| `rounded-button` | 14px | Buttons, list groups, meta strips |
| `rounded-input` | 22px | The ask box |
| `rounded-full` | pill | Chips, header controls, badges, nav pill |
| 14px fixed | | Cuisine tiles (18px in the Surprise reveal) |

- `shadow-card`: warm, low, for cards at rest. `shadow-lift`: sheets and toasts only.
- The ask box uses a hard offset shadow (4px ink, orange on focus): the only "sticker" shadow in the system.
- Never nest more than two containers deep. No card inside a card.

## 7. Buttons

| Kind | Look | Use |
|---|---|---|
| Primary | `bg-orange text-ink font-bold rounded-button`, min 44–48px tall | One per view: Find a plan, Let's go!, Find something |
| Dark | `bg-ink text-cream` | Primary action **on an orange ground** (Surprise me) |
| Outline | `border-2 border-ink` | Secondary next to a primary: Not this one, Try again |
| Secondary green | `bg-green text-surface` | Device actions: Use my location |
| Icon | 44×44 round, `text-muted`, hover `bg-cream` | Save, Close, Profile |

- Labels are verb + object or a clear phrase: "Find a plan", "Surprise me", "Try again". No arrows appended to text.
- Pressed: `active:translate-y-px`. Disabled: `bg-line text-muted`.

## 8. Inputs

- **Ask box:** a 2px ink border with a 4px hard shadow that turns orange on focus. Multi-line and auto-growing
  (`field-sizing: content`). Enter sends, Shift+Enter adds a line. The label is visually hidden; the hint
  "BM, English, rojak pun boleh" sits under the text.
- Future form fields (event submission, sign-in): `surface` ground, 1.5–2px `line-strong` border, `rounded-button`,
  min 48px tall, visible label above, error text under the field in `orange-ink`.

## 9. Cards

**Restaurant card:** cuisine tile (icon on a palette ground) + name + category, save button top right,
then the one-line *reason*, then a meta row (rating, price, distance) above a hairline.
- The reason says *why* (e.g. "Open 24 hours, so it still works after a late movie."). It never repeats the meta.
- Missing rating: omitted. Missing price: "Price unavailable". Missing distance: omitted.

**Event card:** art panel (poster, or the category pattern) with a ticket-style date stub, then
category (mono), title, time, venue + distance, Free/price badge.
- Default (long lists like the Events page): a row on phones, a column from `sm`.
- `stacked` (previews and carousels): always a column with the art on top.

**Preview rail:** on phones a short preview with "See all" (e.g. events on Explore) is a sideways
snap rail that bleeds to the screen edge, with the next card peeking in. It becomes a grid from `sm`.
The rail must be `position: relative` so `sr-only` text inside off-screen cards can't widen the page.
- Fallback art: market = pasar malam awning, music = vinyl rings, campus = ruled exercise-book paper,
  food = dotted tablecloth, other = diagonal stripes. Never a blank box.

Cuisine tiles: cafe = mango-soft + coffee; malay = green-soft + egg; mamak = orange-soft + pot;
japanese = ink + bowl; seafood = green + fish; anything else = cream + utensils.

## 10. Navigation

- **Phones/tablets (< lg):** fixed bottom bar with Explore (compass), Events (calendar), Saved (bookmark), Profile (user).
  The active item has an orange-soft pill and an orange-ink icon with a semibold label. Items are 64px tall.
- **Desktop (≥ lg):** the same links sit in the header as pills, and the bottom bar is hidden.
- Header: wordmark (home), location pill (opens the area sheet), profile button.
- **Sticky filter bar:** filters that control the results below (Explore's chips) stick under the
  header (`top-16`) and gain a hairline and soft shadow only once stuck (`useStuck`).
- Surprise Me is **not** a nav destination. It lives on Explore: a full-width orange banner that is a
  single button (one big tap target), plus the chip in the filter bar.

**Explore layout**
```
Phone                                 Desktop (lg)
[header: lepak.  location  profile]   [header: lepak. Explore Events Saved   location profile]
eyebrow / h1 32px / one line          eyebrow / h1 52px / one line
[ask box                     ]        [ask box                  ][Surprise banner]
[chips, sticky, scroll sideways]      [chips, sticky, wrap]
[Surprise banner             ]        Nearby: 3-column grid
Nearby: stacked cards                 Events: 3-column grid
Events: sideways rail                 prototype note
prototype note
[bottom nav]
```
- Sheets: native `<dialog>`. A bottom sheet on phones, a centred dialog from `sm`; Esc, backdrop click and the close button all dismiss it.

## 11. Icons

- Lucide (`lucide-react`), 2px stroke, 16–24px. Icons sit next to text; they don't replace it,
  except for icon buttons, which always have an `sr-only` label.
- Decorative icons get `aria-hidden="true"`.
- No emoji in the UI.

## 12. Interaction and motion

- Motion answers an action: the sheet pops in (260ms), the Surprise deck fans out on hover, and the
  reveal pops in. Nothing animates on scroll and nothing loops except loading skeletons and the Surprise shuffle.
- Surprise Me: about 0.9s of shuffling names, then the reveal. "Not this one" never repeats the last pick.
- Loading uses skeletons shaped like the real cards. Never a page-level spinner.
- After a submitted ask, focus and scroll move to the "how we read it" summary.
- `prefers-reduced-motion`: all animations and transitions drop to about 0, and the shuffle is skipped.

## 13. Microcopy

Voice: a friend from JB who knows the spots. Malay-English mix where it's natural, plain English
for anything that needs to be understood exactly (errors, settings).

- Sentence case. Short. No exclamation marks except "Let's go!".
- Empty states suggest the next move:
  - "Hmm, kawasan ni quiet sikit." + try expanding the distance or another area
  - "Tak jumpa yang ngam." + loosen the filters (with a Clear filters button)
  - "Nothing happening nearby yet." + maybe check another day
- Errors say what happened and what to do, without apologising: "Couldn't load events. Check your connection, then try again."
- Prototype honesty: "Demo: matched by keywords. The AI isn't connected yet." / "these places and events are sample data".
- Avoid: "Oops!", "Something went wrong", "AI-powered", "seamless", "curated", em dashes.

## 14. Accessibility (WCAG 2.2 AA)

- Contrast: body text ≥ 4.5:1 and UI boundaries ≥ 3:1. Pairs used are listed in section 3.
- Targets ≥ 44×44px (chips, nav items, icon buttons, list rows).
- Focus: one global `:focus-visible` ring, 3px ink with a 2px offset. Never remove it.
- Semantics: one `h1` per page, sections labelled by their `h2`, `<nav aria-label="Main">`, `<time dateTime>`,
  `aria-pressed` on toggles (chips, save), `aria-current` on the active nav link and area, `aria-busy` while loading.
- Live regions: Surprise result (polite), toast (`role=status`), errors (`role=alert`).
- A skip link goes to `#main`. Sheets trap focus (native dialog).
- Works at 320px with no horizontal scroll. Text can be zoomed to 200%.

## 15. Things to avoid

Purple AI gradients · glassmorphism · decorative gradients · emoji as UI · cards inside cards ·
dashboard layouts · stock or fake food photography · scroll-triggered animations · ALL CAPS labels
(except the hero eyebrow) · white text on orange · orange text on cream · invented reviews or "verified" claims ·
a spinner where a skeleton fits.

## 16. Code structure

```
src/
  index.css                 tokens (@theme), base styles, utilities
  App.jsx                   routes (add /results, /surprise, /events/new, /login, /admin here)
  components/
    layout/                 AppShell, Header, BottomNav, Wordmark, LocationSheet, navItems
    ui/                     Sheet, StateMessage, SectionHeader, Toast (generic, no Lepak data)
    cards/                  RestaurantCard, EventCard, EventArt, PlaceMeta, SaveButton, cuisine, eventCategories
    explore/                AskBox, QuickChips, SurpriseCard, SurpriseSheet, AskSummary, Nearby/EventsSection
  pages/                    Explore, Events, Saved, Profile, NotFound
  context/                  LocationContext (area + GPS), SavedContext (local saves)
  hooks/                    useAsync (loading/data/error), useSurprise
  lib/                      mockApi (swap for the real API), demoInterpret, format
  data/                     areas, mock/ (sample restaurants and events)
```
New screens reuse `cards/` and `ui/`. New data goes through a `lib/` function that returns a Promise,
so loading, empty and error states come for free.
