import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Plus, X, Check, Sparkles, Mail, ExternalLink, Zap, ShieldCheck, Star } from "lucide-react";
import { ScenarioForm } from "@/components/profit-calculator/ScenarioForm";
import { ProfitSummary } from "@/components/profit-calculator/ProfitSummary";
import { ExportButtons } from "@/components/profit-calculator/ExportButtons";
import {
  calculateProfit,
  defaultScenario,
  fmtMoney,
  fmtPct,
  type ScenarioInput,
} from "@/lib/profit";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        title:
          "Etsy Fee Calculator — Real Net Profit After Fees, Labor & Ads",
      },
      {
        name: "description",
        content:
          "Free Etsy profit calculator that includes fees, offsite ads, materials, packaging and your labor. Compare pricing scenarios and export PDF/CSV — no signup.",
      },
      {
        name: "keywords",
        content:
          "etsy fee calculator, etsy profit calculator, etsy pricing calculator, etsy seller fees, offsite ads calculator, break even etsy",
      },
      { property: "og:title", content: "Etsy TrueProfit Calculator" },
      {
        property: "og:description",
        content:
          "See what you actually take home after Etsy fees, materials, and your labor. Compare scenarios and export instantly.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "Etsy TrueProfit" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Etsy TrueProfit Calculator" },
      {
        name: "twitter:description",
        content:
          "Free Etsy profit calculator with fees, labor and scenario comparison. No signup.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Etsy TrueProfit Calculator",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Free Etsy profit calculator that factors in Etsy fees, offsite ads, materials, packaging and your labor. Compare pricing scenarios and export PDF/CSV.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "127",
          },
        }),
      },
    ],
  }),
});

function Index() {
  const [scenarioA, setScenarioA] = useState<ScenarioInput>(() =>
    defaultScenario("Standard pricing"),
  );
  const [scenarioB, setScenarioB] = useState<ScenarioInput | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const scenarios = useMemo(
    () => (scenarioB ? [scenarioA, scenarioB] : [scenarioA]),
    [scenarioA, scenarioB],
  );

  const addComparison = () =>
    setScenarioB({
      ...scenarioA,
      name: "Free shipping + higher price",
      freeShipping: true,
      shippingCostYouCover: scenarioA.shippingCharged,
      itemPrice: Math.round((scenarioA.itemPrice + scenarioA.shippingCharged) * 100) / 100,
      shippingCharged: 0,
    });

  const delta = scenarioB
    ? {
        profit:
          calculateProfit(scenarioB).netProfit -
          calculateProfit(scenarioA).netProfit,
        margin:
          calculateProfit(scenarioB).marginPct -
          calculateProfit(scenarioA).marginPct,
      }
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-md">
              <Calculator size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                Etsy TrueProfit
              </p>
              <h1 className="truncate font-display text-xl font-black tracking-tight sm:text-2xl">
                What you actually take home
              </h1>
            </div>
          </div>
          <ExportButtons scenarios={scenarios} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
              <Sparkles size={12} /> Free · No signup
            </span>
            <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Stop guessing.{" "}
              <span className="bg-brand/15 px-2 text-brand">See your real Etsy profit</span>{" "}
              in seconds.
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              The only Etsy calculator that includes fees, materials,
              <em> and your labor</em> — so you know if you're actually making
              money on every sale.
            </p>
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              {[
                "All Etsy US fees baked in",
                "Labor + materials + packaging",
                "Compare two pricing scenarios",
                "Instant CSV & PDF export",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/20 text-success">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-brand/10 via-card to-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
              <Star size={14} className="fill-brand" /> Trusted by makers
            </div>
            <p className="mt-3 font-display text-lg font-bold leading-snug">
              "I raised my prices $8 after seeing my real margin. Wish I'd
              found this a year ago."
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              — Maya R., ceramics shop, 1.2k sales
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> No account</span>
              <span className="inline-flex items-center gap-1"><Zap size={14} /> Instant results</span>
            </div>
          </div>
        </section>

        <div
          className={
            scenarioB
              ? "grid grid-cols-1 gap-6 xl:grid-cols-2"
              : "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
          }
        >
          {/* Scenario A column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <ScenarioForm scenario={scenarioA} onChange={setScenarioA} />
            </div>
            {scenarioB && <ProfitSummary scenario={scenarioA} />}
          </div>

          {/* Right column */}
          {!scenarioB ? (
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <ProfitSummary scenario={scenarioA} />
              <button
                onClick={addComparison}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/40 px-4 py-4 text-sm font-semibold text-muted-foreground transition hover:border-brand hover:bg-brand/5 hover:text-brand"
              >
                <Plus size={16} /> Add comparison scenario
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Scenario B
                  </p>
                  <button
                    onClick={() => setScenarioB(null)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <ScenarioForm scenario={scenarioB} onChange={setScenarioB} />
              </div>
              <ProfitSummary scenario={scenarioB} />
            </div>
          )}
        </div>

        {delta && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold tracking-tight">
              B vs. A
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Δ Net profit
                </p>
                <p
                  className={`mt-1 font-display text-2xl font-black tracking-tight ${
                    delta.profit >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {delta.profit >= 0 ? "+" : ""}
                  {fmtMoney(delta.profit)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Δ Margin
                </p>
                <p
                  className={`mt-1 font-display text-2xl font-black tracking-tight ${
                    delta.margin >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {delta.margin >= 0 ? "+" : ""}
                  {fmtPct(delta.margin)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pro CTA + Email capture + Affiliate sidebar */}
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Pro upgrade */}
          <div className="relative overflow-hidden rounded-2xl border border-brand/40 bg-gradient-to-br from-brand to-[oklch(0.6_0.2_25)] p-6 text-brand-foreground shadow-lg lg:col-span-2">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                <Sparkles size={12} /> TrueProfit Pro
              </span>
              <h3 className="mt-3 font-display text-2xl font-black tracking-tight sm:text-3xl">
                Sync your Etsy shop. Track profit on every order.
              </h3>
              <p className="mt-2 max-w-lg text-sm text-brand-foreground/90 sm:text-base">
                Connect Etsy and see live P&amp;L across all listings, spot
                unprofitable SKUs, and get weekly margin reports.
              </p>
              <ul className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
                {[
                  "Automatic Etsy order sync",
                  "Per-SKU profit tracking",
                  "Weekly email reports",
                  "Unlimited saved scenarios",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} strokeWidth={3} /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand shadow-md transition hover:scale-[1.02]">
                  Upgrade to Pro — $9/mo
                </button>
                <span className="text-xs text-brand-foreground/80">
                  14-day free trial · Cancel anytime
                </span>
              </div>
            </div>
          </div>

          {/* Email capture */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Mail size={12} /> Free guide
            </span>
            <h3 className="mt-3 font-display text-xl font-black tracking-tight">
              The Etsy Pricing Playbook
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Get our 12-page PDF on pricing for profit — plus monthly seller tips.
            </p>
            {emailSubmitted ? (
              <div className="mt-4 rounded-lg bg-success/15 p-3 text-sm font-semibold text-success">
                ✓ Check your inbox — the guide is on its way.
              </div>
            ) : (
              <form
                className="mt-4 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes("@")) setEmailSubmitted(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shop.com"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background transition hover:opacity-90"
                >
                  Send me the playbook
                </button>
                <p className="text-[11px] text-muted-foreground">
                  No spam. Unsubscribe in one click.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* Affiliate recommendations */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-black tracking-tight">
                Tools we recommend for Etsy sellers
              </h3>
              <p className="text-xs text-muted-foreground">
                We may earn a commission — it never affects your price.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: "EverBee",
                tag: "Keyword research",
                copy: "Find high-demand, low-competition listings on Etsy.",
                cta: "Try free",
              },
              {
                name: "Printful",
                tag: "Print-on-demand",
                copy: "No inventory fulfillment for apparel & home goods.",
                cta: "Get started",
              },
              {
                name: "Canva Pro",
                tag: "Listing photos",
                copy: "Mockups and branded templates in minutes.",
                cta: "Start trial",
              },
            ].map((a) => (
              <a
                key={a.name}
                href="#"
                rel="sponsored noopener"
                className="group flex flex-col rounded-xl border border-border bg-background p-4 transition hover:border-brand hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    {a.tag}
                  </span>
                  <ExternalLink
                    size={14}
                    className="text-muted-foreground transition group-hover:text-brand"
                  />
                </div>
                <p className="mt-2 font-display text-lg font-bold">{a.name}</p>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">
                  {a.copy}
                </p>
                <span className="mt-3 text-sm font-semibold text-brand">
                  {a.cta} →
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Calculations are estimates based on standard Etsy US fees (listing
          $0.20, transaction 6.5%, processing 3% + $0.25). Verify against your
          Shop Manager for exact figures.
        </footer>
      </main>
    </div>
  );
}
