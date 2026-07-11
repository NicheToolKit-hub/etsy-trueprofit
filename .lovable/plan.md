# Etsy TrueProfit Calculator

Single-page React dashboard that calculates a seller's real net profit after Etsy fees, materials, and labor — with scenario comparison and no-login exports.

## Scope

Frontend only. No auth, no database. All state lives in the component; exports run client-side.

## Route & files

- `src/routes/index.tsx` — replace placeholder, render the calculator page. Set head() title/description/OG for SEO ("Etsy TrueProfit Calculator — Real Net Profit After Fees & Labor").
- `src/components/profit-calculator/ScenarioForm.tsx` — left column inputs.
- `src/components/profit-calculator/ProfitSummary.tsx` — right column live summary card + break-even.
- `src/components/profit-calculator/ComparisonView.tsx` — side-by-side two-scenario layout.
- `src/components/profit-calculator/ExportButtons.tsx` — PDF + CSV.
- `src/lib/profit.ts` — pure calc functions + TS types (single source of truth, easy to test).
- `src/styles.css` — add Etsy-inspired coral/orange accent tokens (oklch) alongside existing neutrals; keep semantic naming.

## Calculation model (`src/lib/profit.ts`)

Inputs per scenario:
- itemPrice, shippingCharged, quantity
- materialCost, packagingCost
- laborHourlyRate, laborMinutes
- offsiteAds: `'none' | '12' | '15'`
- freeShipping: boolean (forces shippingCharged = 0, adds shipping cost absorbed by seller via a "shipping cost you cover" input)

Derived:
- totalRevenue = (itemPrice + shippingCharged) × quantity
- listingFee = 0.20 × quantity
- transactionFee = 0.065 × totalRevenue
- processingFee = 0.03 × totalRevenue + 0.25 × quantity
- offsiteAdsFee = (rate/100) × totalRevenue when applicable
- laborCost = (laborMinutes/60) × laborHourlyRate × quantity
- totalFees = listing + transaction + processing + offsiteAds
- totalExpenses = materials + packaging + labor (× quantity where per-unit)
- netProfit = totalRevenue − totalFees − totalExpenses
- marginPct = netProfit / totalRevenue
- breakEvenPrice: solve for itemPrice where netProfit = 0 given other inputs

## UI

- Two-column desktop grid, stacked on mobile (`grid-cols-1 lg:grid-cols-[1fr_420px]`).
- Summary card: large bold Net Profit number, margin badge color-coded (green >25%, yellow 10–25%, red <10%), fee/expense breakdown list.
- Free-shipping toggle shows an inline note about margin impact.
- "Add comparison scenario" button reveals Scenario B; layout switches to two summary cards side-by-side with a delta row (Δ profit, Δ margin).
- Break-even panel below summary.
- Sticky summary on mobile bottom, or collapse into an accordion — TBD during build, mobile-first.

## Exports (no login)

- CSV: build string client-side, trigger download via Blob + anchor.
- PDF: use `jspdf` (small, works in browser). Install with `bun add jspdf`.

## Design

- Etsy-inspired accent: coral/orange primary CTA, neutral card surfaces, rounded-2xl, subtle shadows. Keep shadcn tokens; add `--accent-brand` + gradient token in styles.css.
- Typography: distinctive display font for headings via `<link>` in `__root.tsx` head (e.g., Fraunces or Bricolage Grotesque) + Inter body — avoid generic AI look.
- Lucide icons for section headers (Package, Truck, Clock, Percent, TrendingUp).

## SEO

- Update `__root.tsx` defaults away from "Lovable App".
- `index.tsx` head(): unique title, meta description <160 chars, og:title/description, twitter card, single H1 "Etsy TrueProfit Calculator".

## Out of scope

Auth, saving scenarios to a database, multi-currency, Etsy API integration. Can add later behind Lovable Cloud.
