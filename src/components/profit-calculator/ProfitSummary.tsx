import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  calculateBreakEvenPrice,
  calculateProfit,
  fmtMoney,
  fmtPct,
  marginTier,
  type ScenarioInput,
} from "@/lib/profit";

const tierStyles = {
  healthy: {
    ring: "ring-success/40",
    text: "text-success",
    badge: "bg-success/15 text-success",
    Icon: TrendingUp,
    label: "Healthy",
  },
  watch: {
    ring: "ring-warning/40",
    text: "text-warning",
    badge: "bg-warning/15 text-warning",
    Icon: Minus,
    label: "Watch",
  },
  danger: {
    ring: "ring-danger/40",
    text: "text-danger",
    badge: "bg-danger/15 text-danger",
    Icon: TrendingDown,
    label: "Losing money",
  },
} as const;

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "muted" | "danger" | "success";
}) {
  const toneCls =
    tone === "danger"
      ? "text-danger"
      : tone === "success"
        ? "text-success"
        : tone === "muted"
          ? "text-muted-foreground"
          : "";
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className={`min-w-0 truncate ${toneCls}`}>{label}</span>
      <span
        className={`shrink-0 tabular-nums ${strong ? "font-semibold" : ""} ${toneCls}`}
      >
        {value}
      </span>
    </div>
  );
}

export function ProfitSummary({ scenario }: { scenario: ScenarioInput }) {
  const b = calculateProfit(scenario);
  const tier = marginTier(b.marginPct);
  const style = tierStyles[tier];
  const breakEven = calculateBreakEvenPrice(scenario);

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-lg ring-1 ${style.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {scenario.name} · Net profit
          </p>
          <p
            className={`font-display text-4xl font-black tracking-tight sm:text-5xl ${style.text}`}
          >
            {fmtMoney(b.netProfit)}
          </p>
          {scenario.quantity > 1 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {fmtMoney(b.netProfitPerUnit)} per unit × {scenario.quantity}
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
        >
          <style.Icon size={14} />
          {fmtPct(b.marginPct)} · {style.label}
        </span>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Revenue
        </p>
        <Row label="Total revenue" value={fmtMoney(b.totalRevenue)} strong />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Etsy fees
        </p>
        <Row label="Listing fee" value={fmtMoney(b.listingFee)} tone="muted" />
        <Row label="Transaction (6.5%)" value={fmtMoney(b.transactionFee)} tone="muted" />
        <Row
          label="Payment processing (3% + $0.25)"
          value={fmtMoney(b.processingFee)}
          tone="muted"
        />
        {b.offsiteAdsFee > 0 && (
          <Row
            label={`Offsite ads (${scenario.offsiteAds}%)`}
            value={fmtMoney(b.offsiteAdsFee)}
            tone="muted"
          />
        )}
        <Row label="Total fees" value={fmtMoney(b.totalFees)} strong tone="danger" />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your costs
        </p>
        <Row label="Materials" value={fmtMoney(b.materialsCost)} tone="muted" />
        <Row label="Packaging" value={fmtMoney(b.packagingCostTotal)} tone="muted" />
        <Row label="Labor" value={fmtMoney(b.laborCost)} tone="muted" />
        {b.shippingCostAbsorbed > 0 && (
          <Row
            label="Shipping absorbed"
            value={fmtMoney(b.shippingCostAbsorbed)}
            tone="muted"
          />
        )}
        <Row
          label="Total expenses"
          value={fmtMoney(b.totalExpenses)}
          strong
          tone="danger"
        />
      </div>

      <div className="mt-5 rounded-xl bg-muted/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Break-even price
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight">
          {Number.isFinite(breakEven) ? fmtMoney(breakEven) : "—"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Minimum item price to avoid a loss, holding other inputs constant.
        </p>
      </div>
    </div>
  );
}