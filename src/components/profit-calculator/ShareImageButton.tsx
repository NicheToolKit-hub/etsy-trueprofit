import { useState } from "react";
import { Share2, Check } from "lucide-react";
import {
  calculateProfit,
  fmtMoney,
  fmtPct,
  type ScenarioInput,
} from "@/lib/profit";

const W = 1200;
const H = 630;

function drawScenarioCard(
  ctx: CanvasRenderingContext2D,
  s: ScenarioInput,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
) {
  const b = calculateProfit(s);
  // card bg
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // label chip
  ctx.fillStyle = "#F1641E";
  roundRect(ctx, x + 28, y + 28, 90, 30, 15);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 14px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 28 + 45, y + 28 + 15);

  // scenario name
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(truncate(ctx, s.name, w - 56), x + 28, y + 78);

  // Big profit
  const good = b.netProfit >= 0;
  ctx.fillStyle = good ? "#0f8a4a" : "#c8382b";
  ctx.font = "800 60px Fraunces, Georgia, serif";
  ctx.fillText(fmtMoney(b.netProfit), x + 28, y + 118);
  ctx.fillStyle = "#64748b";
  ctx.font = "600 14px Inter, system-ui, sans-serif";
  ctx.fillText("NET PROFIT", x + 28, y + 190);

  // stats grid
  const stats: [string, string][] = [
    ["Margin", fmtPct(b.marginPct)],
    ["Revenue", fmtMoney(b.totalRevenue)],
    ["Etsy fees", fmtMoney(b.totalFees)],
    ["Costs", fmtMoney(b.totalExpenses)],
    ["Price", fmtMoney(s.itemPrice)],
    ["Qty", String(s.quantity)],
  ];
  const rowY = y + 230;
  const colW = (w - 56) / 2;
  stats.forEach(([k, v], i) => {
    const cx = x + 28 + (i % 2) * colW;
    const cy = rowY + Math.floor(i / 2) * 46;
    ctx.fillStyle = "#64748b";
    ctx.font = "500 13px Inter, system-ui, sans-serif";
    ctx.fillText(k.toUpperCase(), cx, cy);
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 20px Inter, system-ui, sans-serif";
    ctx.fillText(v, cx, cy + 18);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}

async function buildImage(scenarios: ScenarioInput[]): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#FFF4EC");
  g.addColorStop(1, "#FFE0CC");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // header
  ctx.fillStyle = "#F1641E";
  roundRect(ctx, 48, 40, 48, 48, 12);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 26px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 48 + 24, 40 + 25);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#F1641E";
  ctx.font = "800 12px Inter, system-ui, sans-serif";
  ctx.fillText("ETSY TRUEPROFIT", 112, 46);
  ctx.fillStyle = "#0f172a";
  ctx.font = "800 26px Fraunces, Georgia, serif";
  ctx.fillText("What you actually take home", 112, 62);

  // cards
  const isCompare = scenarios.length > 1;
  if (isCompare) {
    const cardW = (W - 48 * 2 - 24) / 2;
    const cardH = 430;
    drawScenarioCard(ctx, scenarios[0], 48, 120, cardW, cardH, "A");
    drawScenarioCard(ctx, scenarios[1], 48 + cardW + 24, 120, cardW, cardH, "B");

    // delta
    const a = calculateProfit(scenarios[0]);
    const b = calculateProfit(scenarios[1]);
    const dProfit = b.netProfit - a.netProfit;
    const dMargin = b.marginPct - a.marginPct;
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    const good = dProfit >= 0;
    ctx.fillStyle = good ? "#0f8a4a" : "#c8382b";
    ctx.fillText(
      `B vs A:  ${good ? "+" : ""}${fmtMoney(dProfit)}   •   ${good ? "+" : ""}${fmtPct(dMargin)} margin`,
      W / 2,
      570,
    );
  } else {
    drawScenarioCard(ctx, scenarios[0], 200, 120, W - 400, 430, "SCENARIO");
    ctx.fillStyle = "#64748b";
    ctx.font = "500 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Calculated with Etsy TrueProfit — free at etsytrueprofit.app", W / 2, 570);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 12px Inter, system-ui, sans-serif";
  ctx.fillText("etsytrueprofit.app", W - 48, 595);

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png"),
  );
}

export function ShareImageButton({ scenarios }: { scenarios: ScenarioInput[] }) {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");

  const onClick = async () => {
    try {
      setState("working");
      const blob = await buildImage(scenarios);
      const file = new File([blob], "etsy-trueprofit.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
        share?: (d: { files: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: "My Etsy profit breakdown",
          text: "Calculated with Etsy TrueProfit",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "etsy-trueprofit-share.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
      setState("done");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={state === "working"}
      className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/20 disabled:opacity-60"
    >
      {state === "done" ? <Check size={16} /> : <Share2 size={16} />}
      {state === "working" ? "Rendering…" : state === "done" ? "Ready!" : "Share image"}
    </button>
  );
}