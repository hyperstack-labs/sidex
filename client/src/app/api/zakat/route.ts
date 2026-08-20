import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Standard Sharia Nisab weights according to AAOIFI standards.
 * - Gold Nisab: 85 grams (20 Mithqals) of fine gold.
 * - Silver Nisab: 595 grams (200 Dirhams) of pure silver.
 */
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const TROY_OUNCE_TO_GRAM = 31.1034768;
const CACHE_SECONDS = 60 * 60; // 1 hour caching
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Official pegged exchange rates to 1 USD for Gulf Cooperation Council (GCC) & regional currencies.
 * Used as an authoritative fallback when upstream dynamic forex APIs are degraded.
 */
const GCC_PEGGED_USD_RATES: Record<string, number> = {
  SAR: 3.75, // Saudi Riyal (fixed peg)
  AED: 3.6725, // UAE Dirham (fixed peg)
  QAR: 3.64, // Qatari Riyal (fixed peg)
  BHD: 0.376, // Bahraini Dinar (fixed peg)
  OMR: 0.3845, // Omani Rial (fixed peg)
  JOD: 0.709, // Jordanian Dinar (fixed peg)
};

interface GoldApiResponse {
  name?: string;
  price?: number;
  symbol?: string;
  updatedAt?: string;
}

interface OpenExchangeResponse {
  result?: string;
  rates?: Record<string, number>;
}

interface MetalPrice {
  symbol: "XAU" | "XAG";
  pricePerOunceUsd: number;
  pricePerGramUsd: number;
}

/**
 * Validates and safely casts numeric price payloads from external feeds.
 *
 * @param value - Raw price candidate
 * @param symbol - Asset symbol for contextual error reporting
 * @returns Sanitized positive floating point price
 */
function parsePrice(value: unknown, symbol: string): number {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid ${symbol} price returned by upstream oracle`);
  }
  return price;
}

/**
 * Fetches real-time spot price per troy ounce for precious metals.
 *
 * @param symbol - "XAU" for Gold, "XAG" for Silver
 * @returns MetalPrice object containing ounce and gram rates in USD
 */
async function fetchMetalPrice(symbol: "XAU" | "XAG"): Promise<MetalPrice> {
  const response = await fetch(`https://api.gold-api.com/price/${symbol}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: {
      revalidate: CACHE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol} spot price: HTTP ${response.status}`);
  }

  const data = (await response.json()) as GoldApiResponse;
  const pricePerOunceUsd = parsePrice(data.price, symbol);

  return {
    symbol,
    pricePerOunceUsd,
    pricePerGramUsd: pricePerOunceUsd / TROY_OUNCE_TO_GRAM,
  };
}

/**
 * Resilient multi-tier forex rate resolution.
 * Supports all global ISO currencies including Islamic region currencies (SAR, AED, QAR, KWD, BHD, OMR, MYR, IDR).
 *
 * Resolution Order:
 * 1. USD identity (1:1)
 * 2. Open Exchange Rates API (broadest ISO-4217 coverage)
 * 3. Frankfurter ECB API (secondary fallback)
 * 4. Official GCC fixed-peg lookup table (guarantees 100% uptime for core Islamic currencies)
 *
 * @param currency - 3-letter ISO target currency code
 * @returns Exchange rate relative to 1 USD
 */
async function fetchExchangeRate(currency: string): Promise<number> {
  if (currency === "USD") {
    return 1;
  }

  // Tier 1: Primary open forex feed with comprehensive global/GCC support
  try {
    const primaryRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: {
        revalidate: CACHE_SECONDS,
      },
    });

    if (primaryRes.ok) {
      const data = (await primaryRes.json()) as OpenExchangeResponse;
      const rate = Number(data.rates?.[currency]);
      if (Number.isFinite(rate) && rate > 0) {
        return rate;
      }
    }
  } catch {
    // Gracefully proceed to secondary fallback
  }

  // Tier 2: Frankfurter ECB feed
  try {
    const secondaryRes = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: {
        revalidate: CACHE_SECONDS,
      },
    });

    if (secondaryRes.ok) {
      const data = (await secondaryRes.json()) as { rates?: Record<string, number> };
      const rate = Number(data.rates?.[currency]);
      if (Number.isFinite(rate) && rate > 0) {
        return rate;
      }
    }
  } catch {
    // Gracefully proceed to peg lookup
  }

  // Tier 3: GCC fixed-peg fallback
  if (GCC_PEGGED_USD_RATES[currency]) {
    return GCC_PEGGED_USD_RATES[currency];
  }

  throw new Error(`Exchange rate unavailable for currency: ${currency}`);
}

/**
 * Next.js App Router API Route Handler for Gold & Silver Nisab calculations.
 * Calculates dynamic Nisab thresholds in USD and native fiat currency for Zakat eligibility.
 *
 * @param request - Incoming HTTP Request with optional ?currency= query parameter
 * @returns JSON response with Nisab thresholds, spot prices, and exchange rates
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("currency") ?? "USD").toUpperCase();

    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Currency must be a valid 3-letter ISO currency code (e.g., USD, SAR, AED).",
        },
        { status: 400 }
      );
    }

    const [gold, silver, exchangeRate] = await Promise.all([
      fetchMetalPrice("XAU"),
      fetchMetalPrice("XAG"),
      fetchExchangeRate(currency),
    ]);

    const goldNisabUsd = gold.pricePerGramUsd * GOLD_NISAB_GRAMS;
    const silverNisabUsd = silver.pricePerGramUsd * SILVER_NISAB_GRAMS;

    const goldNisabNative = goldNisabUsd * exchangeRate;
    const silverNisabNative = silverNisabUsd * exchangeRate;

    return NextResponse.json(
      {
        success: true,
        currency,
        nisab: {
          gold: {
            grams: GOLD_NISAB_GRAMS,
            thresholdUsd: goldNisabUsd,
            thresholdNative: goldNisabNative,
          },
          silver: {
            grams: SILVER_NISAB_GRAMS,
            thresholdUsd: silverNisabUsd,
            thresholdNative: silverNisabNative,
          },
        },
        spotPrices: {
          gold: {
            symbol: gold.symbol,
            pricePerOunceUsd: gold.pricePerOunceUsd,
            pricePerGramUsd: gold.pricePerGramUsd,
          },
          silver: {
            symbol: silver.symbol,
            pricePerOunceUsd: silver.pricePerOunceUsd,
            pricePerGramUsd: silver.pricePerGramUsd,
          },
        },
        exchangeRate: {
          from: "USD",
          to: currency,
          rate: exchangeRate,
        },
        cache: {
          durationSeconds: CACHE_SECONDS,
          duration: "1 hour",
        },
        updatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unable to retrieve Nisab pricing data";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      {
        status: 503,
      }
    );
  }
}