export type OffsiteAdsRate = "none" | "12" | "15";

export interface ScenarioInput {
  name: string;
  itemPrice: number;
  shippingCharged: number;
  shippingCostYouCover: number;
  quantity: number;
  materialCost: number;
  packagingCost: number;
  laborHourlyRate: number;
  laborMinutes: number;
  offsiteAds: OffsiteAdsRate;
  freeShipping: boolean;
  notes?: string;
}

export interface ProfitBreakdown {
  totalRevenue: number;
  listingFee: number;
  transactionFee: number;
  processingFee: number;
  offsiteAdsFee: number;
  totalFees: number;
  materialsCost: number;
  packagingCostTotal: number;
  laborCost: number;
  shippingCostAbsorbed: number;
  totalExpenses: number;
  netProfit: number;
  netProfitPerUnit: number;
  marginPct: number;
}

export const defaultScenario = (name = "Scenario A"): ScenarioInput => ({
  name,
  itemPrice: 35,
  shippingCharged: 6,
  shippingCostYouCover: 0,
  quantity: 1,
  materialCost: 6,
  packagingCost: 1.5,
  laborHourlyRate: 20,
  laborMinutes: 30,
  offsiteAds: "none",
  freeShipping: false,
});

const offsiteAdsRate = (v: OffsiteAdsRate) =>
  v === "12" ? 0.12 : v === "15" ? 0.15 : 0;

export function calculateProfit(s: ScenarioInput): ProfitBreakdown {
  const qty = Math.max(0, s.quantity || 0);
  const shippingCharged = s.freeShipping ? 0 : s.shippingCharged;
  const perUnitRevenue = s.itemPrice + shippingCharged;
  const totalRevenue = perUnitRevenue * qty;

  const listingFee = 0.2 * qty;
  const transactionFee = 0.065 * totalRevenue;
  const processingFee = 0.03 * totalRevenue + 0.25 * qty;
  const offsiteAdsFee = offsiteAdsRate(s.offsiteAds) * totalRevenue;
  const totalFees = listingFee + transactionFee + processingFee + offsiteAdsFee;

  const materialsCost = s.materialCost * qty;
  const packagingCostTotal = s.packagingCost * qty;
  const laborCost = (s.laborMinutes / 60) * s.laborHourlyRate * qty;
  const shippingCostAbsorbed = s.freeShipping ? s.shippingCostYouCover * qty : 0;
  const totalExpenses =
    materialsCost + packagingCostTotal + laborCost + shippingCostAbsorbed;

  const netProfit = totalRevenue - totalFees - totalExpenses;
  const netProfitPerUnit = qty > 0 ? netProfit / qty : 0;
  const marginPct = totalRevenue > 0 ? netProfit / totalRevenue : 0;

  return {
    totalRevenue,
    listingFee,
    transactionFee,
    processingFee,
    offsiteAdsFee,
    totalFees,
    materialsCost,
    packagingCostTotal,
    laborCost,
    shippingCostAbsorbed,
    totalExpenses,
    netProfit,
    netProfitPerUnit,
    marginPct,
  };
}

/**
 * Solve for itemPrice such that netProfit === 0, holding all other inputs
 * constant. Closed-form: revenue-side fees scale linearly with itemPrice, so
 * we solve algebraically.
 *
 * Let p = itemPrice per unit. Per unit:
 *   revenue = p + shippingCharged
 *   feeRate = 0.065 + 0.03 + offsiteAdsRate  (applied to revenue)
 *   fixedFeePerUnit = 0.20 + 0.25
 *   perUnitCosts = material + packaging + labor + shippingAbsorbed
 * Net per unit = revenue*(1-feeRate) - fixedFeePerUnit - perUnitCosts = 0
 * => p = (fixedFeePerUnit + perUnitCosts) / (1-feeRate) - shippingCharged
 */
export function calculateBreakEvenPrice(s: ScenarioInput): number {
  const shippingCharged = s.freeShipping ? 0 : s.shippingCharged;
  const feeRate = 0.065 + 0.03 + offsiteAdsRate(s.offsiteAds);
  const fixedFeePerUnit = 0.2 + 0.25;
  const laborPerUnit = (s.laborMinutes / 60) * s.laborHourlyRate;
  const shippingAbsorbedPerUnit = s.freeShipping ? s.shippingCostYouCover : 0;
  const perUnitCosts =
    s.materialCost + s.packagingCost + laborPerUnit + shippingAbsorbedPerUnit;
  const denom = 1 - feeRate;
  if (denom <= 0) return Number.POSITIVE_INFINITY;
  return (fixedFeePerUnit + perUnitCosts) / denom - shippingCharged;
}

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

export const fmtPct = (n: number) =>
  `${(n * 100).toFixed(1)}%`;

export type MarginTier = "healthy" | "watch" | "danger";
export const marginTier = (marginPct: number): MarginTier =>
  marginPct > 0.25 ? "healthy" : marginPct >= 0.1 ? "watch" : "danger";