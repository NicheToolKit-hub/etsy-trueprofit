import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
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
  hint,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "muted" | "danger" | "success";
  hint?: string;
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
      <span className={`flex min-w-0 items-center gap-1.5 ${toneCls}`}>
        <span className="truncate">{label}</span>
        {hint && (
          <span
            tabIndex={0}
            role="button"
            aria-label={hint}
            title={hint}
            className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground/70 hover:text-brand focus:text-brand focus:outline-none"
          >
            <HelpCircle size={12} />
          </span>
        )}
      </span>
      <span
        className={`shrink-0 tabular-nums ${strong ? "font-semibold" : ""} ${toneCls}`}
      >
        {value}
      </span>
    </div>
  );
}

function BreakdownChart({
  fees,
  costs,
  profit,
  revenue,
}: {
  fees: number;
  costs: number;
  profit: number;
  revenue: number;
}) {
  const profitSlice = Math.max(0, profit);
  const total = fees + costs + profitSlice;
  if (revenue <= 0 || total <= 0) return null;

  const size = 120;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const segs = [
    { label: "Fees", value: fees, color: "var(--danger)" },
    { label: "Costs", value: costs, color: "var(--warning)" },
    { label: "Profit", value: profitSlice, color: "var(--success)" },
  ];
  let offset = 0;
  return (
    <div className="mt-5 flex items-center gap-5 rounded-xl bg-muted/40 p-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        {segs.map((s) => {
          const frac = s.value / total;
          const len = frac * c;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="flex-1 space-y-1.5 text-sm">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {((s.value / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
        {profit < 0 && (
          <li className="pt-1 text-xs text-danger">
            Note: losing {fmtMoney(-profit)} — profit shown as 0% of pie.
          </li>
        )}
      </ul>
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
        <Row
          label="Listing fee"
          value={fmtMoney(b.listingFee)}
          tone="muted"
          hint="Etsy charges $0.20 per listing, per unit sold. A listing also auto-renews for $0.20 every 4 months or after each sale."
        />
        <Row
          label="Transaction (6.5%)"
          value={fmtMoney(b.transactionFee)}
          tone="muted"
          hint="6.5% of the total order (item price + shipping + gift wrap). Applied on every sale."
        />
        <Row
          label="Payment processing (3% + $0.25)"
          value={fmtMoney(b.processingFee)}
          tone="muted"
          hint="Etsy Payments fee for US sellers: 3% of the total order + $0.25 per order. Rates vary by country."
        />
        {b.offsiteAdsFee > 0 && (
          <Row
            label={`Offsite ads (${scenario.offsiteAds}%)`}
            value={fmtMoney(b.offsiteAdsFee)}
            tone="muted"
            hint="Charged only when a buyer arrives via one of Etsy's off-site ads (Google, Facebook, etc.). 12% for shops over $10k/yr (mandatory), 15% for smaller shops (opt-in)."
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

      <BreakdownChart
        fees={b.totalFees}
        costs={b.totalExpenses}
        profit={b.netProfit}
        revenue={b.totalRevenue}
      />

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