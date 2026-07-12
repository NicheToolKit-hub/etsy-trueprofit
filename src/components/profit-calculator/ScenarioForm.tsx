import { useEffect, useState } from "react";
import { Package, Truck, Clock, Percent, Tag, HelpCircle } from "lucide-react";
import type { ScenarioInput, OffsiteAdsRate } from "@/lib/profit";

interface Props {
  scenario: ScenarioInput;
  onChange: (next: ScenarioInput) => void;
  compact?: boolean;
}

const numberInput =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

const label = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function InfoTip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      role="button"
      aria-label={text}
      title={text}
      className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-muted-foreground/70 hover:text-brand focus:text-brand focus:outline-none"
    >
      <HelpCircle size={13} />
    </span>
  );
}

function Field({
  id,
  label: text,
  prefix,
  suffix,
  value,
  onChange,
  step = "0.01",
  min = "0",
  hint,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (n: number) => void;
  step?: string;
  min?: string;
  hint?: string;
}) {
  // Local string state so leading zeros / partial input like "0." don't get
  // clobbered while typing. Sync from external value only when not focused.
  const [text_, setText] = useState<string>(
    Number.isFinite(value) ? String(value) : "",
  );
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) {
      const external = Number.isFinite(value) ? String(value) : "";
      const parsedLocal = parseFloat(text_);
      if (!Number.isFinite(parsedLocal) || parsedLocal !== value) {
        setText(external);
      }
    }
  }, [value, focused, text_]);

  const normalize = (raw: string) => {
    // Strip leading zeros: "050" -> "50", "0.5" -> "0.5", "" stays ""
    if (raw === "" || raw === "-") return raw;
    // Allow a leading "0." decimal
    if (/^-?0\d/.test(raw)) raw = raw.replace(/^(-?)0+/, "$1");
    if (raw === "" || raw === "-") return "0";
    return raw;
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className={label}>
          {text}
        </label>
        {hint && <InfoTip text={hint} />}
      </div>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-input bg-background focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        {prefix && (
          <span className="flex items-center bg-muted/60 px-2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={text_}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            const n = parseFloat(text_);
            const clean = Number.isFinite(n) ? n : 0;
            setText(String(clean));
            if (clean !== value) onChange(clean);
          }}
          onChange={(e) => {
            const cleaned = normalize(e.target.value);
            setText(cleaned);
            const n = parseFloat(cleaned);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm outline-none"
        />
        {suffix && (
          <span className="flex items-center bg-muted/60 px-2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
          <Icon size={16} />
        </span>
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ScenarioForm({ scenario, onChange }: Props) {
  const set = <K extends keyof ScenarioInput>(k: K, v: ScenarioInput[K]) =>
    onChange({ ...scenario, [k]: v });

  return (
    <div className="space-y-6">
      <div>
        <label className={label}>Scenario name</label>
        <input
          value={scenario.name}
          onChange={(e) => set("name", e.target.value)}
          className={`mt-1 ${numberInput}`}
        />
      </div>

      <Section icon={Tag} title="Product & pricing">
        <Field
          id={`price-${scenario.name}`}
          label="Item price"
          prefix="$"
          value={scenario.itemPrice}
          onChange={(v) => set("itemPrice", v)}
        />
        <Field
          id={`qty-${scenario.name}`}
          label="Quantity"
          value={scenario.quantity}
          step="1"
          min="1"
          onChange={(v) => set("quantity", Math.max(1, Math.round(v)))}
        />
      </Section>

      <Section icon={Truck} title="Shipping">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-input bg-muted/30 px-3 py-2">
            <span className="text-sm font-medium">Offer free shipping</span>
            <input
              type="checkbox"
              checked={scenario.freeShipping}
              onChange={(e) => set("freeShipping", e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
          </label>
          {scenario.freeShipping && (
            <p className="mt-2 text-xs text-warning">
              Buyer pays $0 shipping — you absorb the cost below.
            </p>
          )}
        </div>
        {!scenario.freeShipping ? (
          <Field
            id={`ship-${scenario.name}`}
            label="Shipping charged to buyer"
            prefix="$"
            value={scenario.shippingCharged}
            onChange={(v) => set("shippingCharged", v)}
          />
        ) : (
          <Field
            id={`shipabsorb-${scenario.name}`}
            label="Shipping cost you cover"
            prefix="$"
            value={scenario.shippingCostYouCover}
            onChange={(v) => set("shippingCostYouCover", v)}
          />
        )}
      </Section>

      <Section icon={Package} title="Costs per unit">
        <Field
          id={`mat-${scenario.name}`}
          label="Materials"
          prefix="$"
          value={scenario.materialCost}
          onChange={(v) => set("materialCost", v)}
        />
        <Field
          id={`pack-${scenario.name}`}
          label="Packaging"
          prefix="$"
          value={scenario.packagingCost}
          onChange={(v) => set("packagingCost", v)}
        />
      </Section>

      <Section icon={Clock} title="Your labor">
        <Field
          id={`rate-${scenario.name}`}
          label="Hourly rate"
          prefix="$"
          suffix="/hr"
          value={scenario.laborHourlyRate}
          onChange={(v) => set("laborHourlyRate", v)}
        />
        <Field
          id={`min-${scenario.name}`}
          label="Minutes per item"
          suffix="min"
          step="1"
          value={scenario.laborMinutes}
          onChange={(v) => set("laborMinutes", v)}
        />
      </Section>

      <Section icon={Percent} title="Etsy offsite ads">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-1.5">
            <label className={label} htmlFor={`ads-${scenario.name}`}>
              Offsite ads fee
            </label>
            <InfoTip text="Etsy advertises your listings on Google, Facebook, etc. If a buyer clicks one of those ads and orders within 30 days, Etsy charges 12% (shops over $10k/yr, mandatory) or 15% (shops under $10k/yr, optional) of the order total." />
          </div>
          <select
            id={`ads-${scenario.name}`}
            value={scenario.offsiteAds}
            onChange={(e) =>
              set("offsiteAds", e.target.value as OffsiteAdsRate)
            }
            className={`mt-1 ${numberInput}`}
          >
            <option value="none">None (not from offsite ad)</option>
            <option value="12">12% — sellers over $10k / yr</option>
            <option value="15">15% — sellers under $10k / yr</option>
          </select>
        </div>
      </Section>
    </div>
  );
}