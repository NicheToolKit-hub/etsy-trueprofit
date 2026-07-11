import { FileDown, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  calculateBreakEvenPrice,
  calculateProfit,
  fmtMoney,
  fmtPct,
  type ScenarioInput,
} from "@/lib/profit";

function rows(s: ScenarioInput) {
  const b = calculateProfit(s);
  const be = calculateBreakEvenPrice(s);
  return [
    ["Scenario", s.name],
    ["Item price", fmtMoney(s.itemPrice)],
    ["Quantity", String(s.quantity)],
    ["Free shipping", s.freeShipping ? "Yes" : "No"],
    ["Shipping charged", fmtMoney(s.freeShipping ? 0 : s.shippingCharged)],
    ["Shipping absorbed", fmtMoney(b.shippingCostAbsorbed)],
    ["Offsite ads", s.offsiteAds === "none" ? "None" : `${s.offsiteAds}%`],
    ["Materials", fmtMoney(b.materialsCost)],
    ["Packaging", fmtMoney(b.packagingCostTotal)],
    ["Labor", fmtMoney(b.laborCost)],
    ["Listing fee", fmtMoney(b.listingFee)],
    ["Transaction fee", fmtMoney(b.transactionFee)],
    ["Processing fee", fmtMoney(b.processingFee)],
    ["Offsite ads fee", fmtMoney(b.offsiteAdsFee)],
    ["Total revenue", fmtMoney(b.totalRevenue)],
    ["Total fees", fmtMoney(b.totalFees)],
    ["Total expenses", fmtMoney(b.totalExpenses)],
    ["Net profit", fmtMoney(b.netProfit)],
    ["Net margin", fmtPct(b.marginPct)],
    ["Break-even price", Number.isFinite(be) ? fmtMoney(be) : "—"],
  ];
}

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ scenarios }: { scenarios: ScenarioInput[] }) {
  const exportCsv = () => {
    const cols = ["Field", ...scenarios.map((s) => s.name)];
    const merged: Record<string, string[]> = {};
    scenarios.forEach((s, i) => {
      for (const [k, v] of rows(s)) {
        merged[k] = merged[k] ?? Array(scenarios.length).fill("");
        merged[k][i] = v;
      }
    });
    const lines = [cols.join(",")];
    for (const [field, vals] of Object.entries(merged)) {
      const esc = (x: string) => `"${x.replace(/"/g, '""')}"`;
      lines.push([esc(field), ...vals.map(esc)].join(","));
    }
    download(
      "etsy-trueprofit.csv",
      new Blob([lines.join("\n")], { type: "text/csv" }),
    );
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 48;
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Etsy TrueProfit — Report", margin, y);
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(new Date().toLocaleString(), margin, y);
    y += 20;

    scenarios.forEach((s) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(s.name, margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const [k, v] of rows(s)) {
        if (y > 740) {
          doc.addPage();
          y = margin;
        }
        doc.text(k, margin, y);
        doc.text(v, 400, y);
        y += 14;
      }
      y += 12;
    });

    doc.save("etsy-trueprofit.pdf");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportCsv}
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
      >
        <FileDown size={16} /> Download CSV
      </button>
      <button
        onClick={exportPdf}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground shadow transition hover:brightness-105"
      >
        <FileText size={16} /> Export PDF
      </button>
    </div>
  );
}