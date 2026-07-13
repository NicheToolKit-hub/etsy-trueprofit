import { useState } from "react";
import { BookOpen } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  calculateBreakEvenPrice,
  calculateProfit,
  fmtMoney,
  fmtPct,
  type ScenarioInput,
} from "@/lib/profit";

const BRAND = "#F1641E";
const INK = "#0F172A";
const MUTED = "#64748B";
const SUCCESS = "#0F8A4A";
const DANGER = "#C8382B";
const SOFT = "#FFF4EC";

function setFill(doc: jsPDF, hex: string) {
  doc.setFillColor(hex);
}
function setText(doc: jsPDF, hex: string) {
  doc.setTextColor(hex);
}

function coverPage(doc: jsPDF, scenarios: ScenarioInput[]) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  setFill(doc, SOFT);
  doc.rect(0, 0, W, H, "F");
  setFill(doc, BRAND);
  doc.rect(0, 0, W, 6, "F");

  // Logo mark
  setFill(doc, BRAND);
  doc.roundedRect(48, 60, 44, 44, 8, 8, "F");
  setText(doc, "#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("$", 70, 90, { align: "center" });

  setText(doc, BRAND);
  doc.setFontSize(10);
  doc.text("ETSY TRUEPROFIT", 104, 78);
  setText(doc, INK);
  doc.setFontSize(22);
  doc.text("Profit Summary Kit", 104, 96);

  // Hero
  setText(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.text("Your real take-home", 48, 200);
  doc.text("on every Etsy sale.", 48, 240);

  setText(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const intro =
    "A branded, sharable breakdown of your pricing — fees, materials, packaging, labor and net margin. Use it to price with confidence, share with clients or pitch wholesale buyers.";
  doc.text(doc.splitTextToSize(intro, W - 96), 48, 274);

  // Scenario chip list
  let y = 340;
  scenarios.forEach((s, i) => {
    const b = calculateProfit(s);
    setFill(doc, "#ffffff");
    doc.roundedRect(48, y, W - 96, 70, 12, 12, "F");
    setFill(doc, BRAND);
    doc.roundedRect(60, y + 14, 40, 20, 6, 6, "F");
    setText(doc, "#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(i === 0 ? "A" : "B", 80, y + 28, { align: "center" });

    setText(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(s.name, 112, y + 30);
    setText(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${fmtMoney(s.itemPrice)} × ${s.quantity}  •  ${s.freeShipping ? "Free shipping" : "Buyer pays shipping"}`,
      112,
      y + 46,
    );

    setText(doc, b.netProfit >= 0 ? SUCCESS : DANGER);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(fmtMoney(b.netProfit), W - 60, y + 32, { align: "right" });
    setText(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`NET · ${fmtPct(b.marginPct)} margin`, W - 60, y + 48, {
      align: "right",
    });

    y += 82;
  });

  // Footer
  setText(doc, MUTED);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} · etsytrueprofit.app`,
    48,
    H - 40,
  );
}

function scenarioPage(doc: jsPDF, s: ScenarioInput, label: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const b = calculateProfit(s);
  const be = calculateBreakEvenPrice(s);

  // Header band
  setFill(doc, BRAND);
  doc.rect(0, 0, W, 90, "F");
  setText(doc, "#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`SCENARIO ${label}`, 48, 40);
  doc.setFontSize(22);
  doc.text(s.name, 48, 66);

  // Headline number
  const good = b.netProfit >= 0;
  setText(doc, good ? SUCCESS : DANGER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.text(fmtMoney(b.netProfit), 48, 156);
  setText(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`NET PROFIT · ${fmtPct(b.marginPct)} margin`, 48, 176);

  // Right-side KPIs
  const kpis: [string, string][] = [
    ["Revenue", fmtMoney(b.totalRevenue)],
    ["Etsy fees", fmtMoney(b.totalFees)],
    ["Costs", fmtMoney(b.totalExpenses)],
    ["Break-even price", Number.isFinite(be) ? fmtMoney(be) : "—"],
  ];
  let ky = 130;
  kpis.forEach(([k, v]) => {
    setText(doc, MUTED);
    doc.setFontSize(9);
    doc.text(k.toUpperCase(), W - 48, ky, { align: "right" });
    setText(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(v, W - 48, ky + 14, { align: "right" });
    doc.setFont("helvetica", "normal");
    ky += 34;
  });

  // Section: Breakdown table
  let y = 230;
  setText(doc, INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Full breakdown", 48, y);
  y += 14;
  setFill(doc, "#E2E8F0");
  doc.rect(48, y, W - 96, 0.6, "F");
  y += 12;

  const rows: [string, string][] = [
    ["Item price", fmtMoney(s.itemPrice)],
    ["Quantity", String(s.quantity)],
    [
      "Shipping charged",
      s.freeShipping ? "Free (buyer)" : fmtMoney(s.shippingCharged),
    ],
    ["Shipping absorbed", fmtMoney(b.shippingCostAbsorbed)],
    ["Offsite ads", s.offsiteAds === "none" ? "None" : `${s.offsiteAds}%`],
    ["Materials", fmtMoney(b.materialsCost)],
    ["Packaging", fmtMoney(b.packagingCostTotal)],
    ["Labor", fmtMoney(b.laborCost)],
    ["Listing fee", fmtMoney(b.listingFee)],
    ["Transaction fee (6.5%)", fmtMoney(b.transactionFee)],
    ["Processing fee (3% + $0.25)", fmtMoney(b.processingFee)],
    ["Offsite ads fee", fmtMoney(b.offsiteAdsFee)],
    ["— Total revenue", fmtMoney(b.totalRevenue)],
    ["— Total fees", fmtMoney(b.totalFees)],
    ["— Total expenses", fmtMoney(b.totalExpenses)],
    ["Net profit", fmtMoney(b.netProfit)],
  ];

  doc.setFontSize(11);
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      setFill(doc, "#F8FAFC");
      doc.rect(48, y - 10, W - 96, 20, "F");
    }
    setText(doc, INK);
    doc.setFont("helvetica", "normal");
    doc.text(r[0], 56, y + 4);
    doc.setFont("helvetica", "bold");
    doc.text(r[1], W - 56, y + 4, { align: "right" });
    y += 20;
  });

  // Footer
  setText(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Estimates based on standard Etsy US fees. Verify in Shop Manager.",
    48,
    H - 50,
  );
  doc.text("etsytrueprofit.app", W - 48, H - 50, { align: "right" });
}

function tipsPage(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  setFill(doc, SOFT);
  doc.rect(0, 0, W, H, "F");

  setText(doc, BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BONUS", 48, 70);
  setText(doc, INK);
  doc.setFontSize(26);
  doc.text("5 ways to raise your margin this week", 48, 100);

  const tips: [string, string][] = [
    [
      "Raise price before you cut cost.",
      "A $2 price bump on a $30 listing typically adds ~$1.70 to net profit — cutting materials $2 rarely saves the full amount after waste.",
    ],
    [
      "Test free shipping + higher price.",
      "Etsy boosts free-shipping listings in search. Bake the ship cost into the price and compare margin in the A/B tool.",
    ],
    [
      "Charge for your time.",
      "If your hourly rate is $0 you're subsidising the buyer. Set at least $20/hr and re-run the numbers.",
    ],
    [
      "Audit Offsite Ads orders.",
      "12–15% off orders driven by Etsy Ads can flip winners into losers. Toggle it on to see the true hit.",
    ],
    [
      "Kill the bottom 20%.",
      "Any listing with a margin under 15% either needs a price change or should be retired.",
    ],
  ];

  let y = 140;
  tips.forEach(([h, body], i) => {
    setFill(doc, BRAND);
    doc.circle(58, y + 6, 12, "F");
    setText(doc, "#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(String(i + 1), 58, y + 10, { align: "center" });

    setText(doc, INK);
    doc.setFontSize(13);
    doc.text(h, 82, y + 4);
    setText(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(body, W - 140), 82, y + 20);
    y += 68;
  });

  setText(doc, MUTED);
  doc.setFontSize(9);
  doc.text("etsytrueprofit.app · Free calculator · Pro plan syncs your shop", 48, H - 40);
}

export function ProfitKitButton({ scenarios }: { scenarios: ScenarioInput[] }) {
  const [busy, setBusy] = useState(false);
  const onClick = async () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      coverPage(doc, scenarios);
      scenarios.forEach((s, i) => {
        doc.addPage();
        scenarioPage(doc, s, i === 0 ? "A" : "B");
      });
      doc.addPage();
      tipsPage(doc);
      doc.save("etsy-trueprofit-kit.pdf");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand to-[oklch(0.6_0.2_25)] px-3 py-2 text-sm font-bold text-brand-foreground shadow transition hover:brightness-110 disabled:opacity-60"
    >
      <BookOpen size={16} /> {busy ? "Building…" : "Profit Kit PDF"}
    </button>
  );
}