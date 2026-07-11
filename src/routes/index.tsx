import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Plus, X } from "lucide-react";
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
});

function Index() {
  const [scenarioA, setScenarioA] = useState<ScenarioInput>(() =>
    defaultScenario("Standard pricing"),
  );
  const [scenarioB, setScenarioB] = useState<ScenarioInput | null>(null);

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
        <section className="mb-8 max-w-2xl">
          <p className="font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            See your{" "}
            <span className="bg-brand/15 px-2 text-brand">real net profit</span>{" "}
            after Etsy fees, materials, and your time.
          </p>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Change any number to update instantly. Compare pricing scenarios
            side-by-side. Export CSV or PDF — no signup, no email.
          </p>
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

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Calculations are estimates based on standard Etsy US fees (listing
          $0.20, transaction 6.5%, processing 3% + $0.25). Verify against your
          Shop Manager for exact figures.
        </footer>
      </main>
    </div>
  );
}
