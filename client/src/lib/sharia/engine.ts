/**
 * AAOIFI Sharia Compliance Rule Engine & Zakat Mathematical Framework.
 *
 * Implements standard financial ratio thresholds based on:
 * - AAOIFI Sharia Standard No. 21 (Financial Papers & Shares)
 * - AAOIFI Sharia Standard No. 59 (Sale of Debt & Receivables)
 * - Classical Fiqh of Zakat for precious metal Nisab benchmarks.
 */

export interface TokenFinancials {
  symbol: string;
  name: string;
  marketCapUsd: number;
  totalDebtUsd: number;
  cashAndInterestBearingUsd: number;
  totalRevenueUsd: number;
  impermissibleRevenueUsd: number;
  primaryActivityCompliant: boolean;
}

export interface ShariaAuditResult {
  compliant: boolean;
  score: number; // 0 to 100
  debtRatioPercent: number;
  cashRatioPercent: number;
  impermissibleRevenuePercent: number;
  reasons: string[];
  standardsReferenced: string[];
}

export interface ZakatEvaluationInput {
  totalEligibleAssetsUsd: number;
  nisabGoldUsd: number;
  nisabSilverUsd: number;
  useSilverBenchmark?: boolean;
  isSolarYear?: boolean;
}

export interface ZakatEvaluationResult {
  isObligated: boolean;
  nisabThresholdUsedUsd: number;
  benchmarkType: "GOLD_85G" | "SILVER_595G";
  netZakatDueUsd: number;
  zakatRatePercent: number;
  surplusAboveNisabUsd: number;
}

/** Maximum permissible debt to market capitalization ratio under AAOIFI standards (33%). */
export const MAX_DEBT_RATIO_PERCENT = 33.0;

/** Maximum permissible cash & interest-bearing assets ratio under AAOIFI standards (33%). */
export const MAX_CASH_RATIO_PERCENT = 33.0;

/** Maximum tolerable impure/non-permissible revenue threshold requiring purification (5%). */
export const MAX_IMPERMISSIBLE_REVENUE_PERCENT = 5.0;

/** Standard lunar Zakat rate (2.5%). */
export const LUNAR_ZAKAT_RATE_PERCENT = 2.5;

/** Solar calendar adjusted Zakat rate (2.577%). */
export const SOLAR_ZAKAT_RATE_PERCENT = 2.5775;

/**
 * Evaluates an asset or token against AAOIFI screening standards.
 *
 * @param financials - Token balance sheet and revenue metrics.
 * @returns Detailed audit outcome with numeric compliance ratios and flags.
 */
export function auditTokenShariaCompliance(financials: TokenFinancials): ShariaAuditResult {
  const reasons: string[] = [];
  const standardsReferenced: string[] = [
    "AAOIFI Sharia Standard No. 21 (Shares)",
    "AAOIFI Sharia Standard No. 59 (Sale of Debt)",
  ];

  if (!financials.primaryActivityCompliant) {
    reasons.push("Core business activity violates fundamental Sharia guidelines.");
  }

  const marketCap = Math.max(financials.marketCapUsd, 1);
  const debtRatio = (financials.totalDebtUsd / marketCap) * 100;
  const cashRatio = (financials.cashAndInterestBearingUsd / marketCap) * 100;

  const totalRevenue = Math.max(financials.totalRevenueUsd, 1);
  const impermissibleRevRatio = (financials.impermissibleRevenueUsd / totalRevenue) * 100;

  if (debtRatio > MAX_DEBT_RATIO_PERCENT) {
    reasons.push(
      `Debt-to-Market Cap ratio (${debtRatio.toFixed(1)}%) exceeds AAOIFI maximum threshold of ${MAX_DEBT_RATIO_PERCENT}%.`
    );
  }

  if (cashRatio > MAX_CASH_RATIO_PERCENT) {
    reasons.push(
      `Cash & Interest-bearing assets ratio (${cashRatio.toFixed(1)}%) exceeds maximum threshold of ${MAX_CASH_RATIO_PERCENT}%.`
    );
  }

  if (impermissibleRevRatio > MAX_IMPERMISSIBLE_REVENUE_PERCENT) {
    reasons.push(
      `Impermissible revenue ratio (${impermissibleRevRatio.toFixed(1)}%) exceeds allowable purification ceiling of ${MAX_IMPERMISSIBLE_REVENUE_PERCENT}%.`
    );
  }

  const isCompliant = reasons.length === 0;

  // Calculate normalized compliance score (0-100)
  let score = 100;
  if (!financials.primaryActivityCompliant) score -= 50;
  if (debtRatio > MAX_DEBT_RATIO_PERCENT)
    score -= Math.min(25, (debtRatio - MAX_DEBT_RATIO_PERCENT) * 2);
  if (cashRatio > MAX_CASH_RATIO_PERCENT)
    score -= Math.min(25, (cashRatio - MAX_CASH_RATIO_PERCENT) * 2);
  if (impermissibleRevRatio > MAX_IMPERMISSIBLE_REVENUE_PERCENT)
    score -= Math.min(20, impermissibleRevRatio * 2);

  return {
    compliant: isCompliant,
    score: Math.max(0, Math.round(score)),
    debtRatioPercent: parseFloat(debtRatio.toFixed(2)),
    cashRatioPercent: parseFloat(cashRatio.toFixed(2)),
    impermissibleRevenuePercent: parseFloat(impermissibleRevRatio.toFixed(2)),
    reasons,
    standardsReferenced,
  };
}

/**
 * Calculates Zakat obligation on liquid and tradeable crypto portfolio balances.
 *
 * @param input - Portfolio totals, current Gold/Silver Nisab thresholds, and calendar mode.
 * @returns Exact Zakat liability and calculation breakdown.
 */
export function calculateZakatObligation(input: ZakatEvaluationInput): ZakatEvaluationResult {
  const threshold = input.useSilverBenchmark ? input.nisabSilverUsd : input.nisabGoldUsd;
  const benchmarkType = input.useSilverBenchmark ? "SILVER_595G" : "GOLD_85G";
  const rate = input.isSolarYear ? SOLAR_ZAKAT_RATE_PERCENT : LUNAR_ZAKAT_RATE_PERCENT;

  const isObligated = input.totalEligibleAssetsUsd >= threshold && threshold > 0;
  const netZakatDueUsd = isObligated ? (input.totalEligibleAssetsUsd * rate) / 100 : 0;
  const surplusAboveNisabUsd = isObligated ? input.totalEligibleAssetsUsd - threshold : 0;

  return {
    isObligated,
    nisabThresholdUsedUsd: threshold,
    benchmarkType,
    netZakatDueUsd: parseFloat(netZakatDueUsd.toFixed(2)),
    zakatRatePercent: rate,
    surplusAboveNisabUsd: parseFloat(surplusAboveNisabUsd.toFixed(2)),
  };
}
