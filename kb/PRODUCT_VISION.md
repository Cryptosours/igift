# iGift — Product Vision

## Brand Feel
**Trustworthy. Intelligent. Clean.** iGift should feel like a financial-grade data product dressed in consumer-friendly UX — not a coupon site, not a flashy deal aggregator, not a marketplace.

The closest analog in feel: a Bloomberg terminal crossed with Wirecutter — rigorous data, clear opinions, transparent methodology.

## Tone of Voice
- Confident but not aggressive
- Factual, precise, evidence-first
- Transparent about limitations ("confidence: 78%" is better than pretending certainty)
- Never hype — "Historical Low" is a fact label, not a marketing gimmick
- Protective — we warn users about risks, not just opportunities

## Visual Direction

### Colors
- **Primary:** Deep indigo (brand-600 #4f46e5) — trust, intelligence, premium
- **Deal/savings:** Emerald green (deal-500 #10b981) — money, value, go
- **Alert/premium:** Amber (alert-500 #f59e0b) — attention, premium, urgency
- **Trust zones:** Green (#22c55e), Yellow (#eab308), Red (#ef4444) — traffic-light UX
- **Dark mode (default):** Deep navy-indigo surface scale (#0B0F1A → #F8F9FB)
- **Light mode:** Warm cream paper — no harsh #ffffff (#F5F3EE → #0D0B08)
- **Cards:** Surface-100 with subtle borders, elevated on hover — never harsh white

### Typography
- **Display/Headings:** Inter — clean, modern, professional, excellent number rendering
- **Body:** Inter — consistent throughout
- **Prices/Scores:** JetBrains Mono — tabular numerals, makes pricing data scannable
- **Scale:** 4px grid, type scale from xs (12px) to 6xl (60px)

### Layout Principles
- Max width 1280px (max-w-7xl)
- Generous whitespace — information density through structure, not cramming
- Cards as primary containers for deals
- Two-column deal grids on desktop, single on mobile
- Sticky header with search and alert CTA always visible
- Trust badges always visible — never hidden or minimized

### Component Patterns
- **Deal Card:** Brand + title, effective price + face value, discount badge, trust badge, score badge, meta row (region, freshness, source), CTA button
- **Trust Badge:** Color-coded pill with shield icon (Green/Yellow/Red)
- **Deal Score:** Gradient pill showing score number + label (Excellent/Good/Fair/Weak)
- **Price Display:** Monospace, tabular-nums, effective price prominent, face value struck-through
- **Filter Pills:** Rounded pills with hover state, clear active indication
- **Alert Form:** Clean inputs, brand-colored CTA, minimal fields

### Responsive Behavior
- Mobile-first design
- Header collapses to hamburger on mobile
- Deal cards stack single-column
- Category grid: 1 col mobile, 2 col tablet, 3 col desktop

### What This Is NOT
- Not a coupon site (no garish colors, no countdown timers, no "HURRY!")
- Not a marketplace (no seller profiles, no checkout flow)
- Not a crypto product (no blockchain aesthetic)
- Not a social platform (no user profiles, no forums in V1)
