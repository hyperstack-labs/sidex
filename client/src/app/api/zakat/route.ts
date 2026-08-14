import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;
const TROY_OUNCE_TO_GRAM = 31.1034768;
const CACHE_SECONDS = 60 * 60;

type GoldApiResponse = {
  name?: string;
  price?: number;
  symbol?: string;
  updatedAt?: string;
};

type ExchangeRateResponse = {
  rates?: Record<string, number>;
};

type MetalPrice = {
  symbol: string;
  pricePerOunceUsd: number;
  pricePerGramUsd: number;
};

function parsePrice(value: unknown, symbol: string): number {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid ${symbol} price returned by provider`);
  }

  return price;
}

async function fetchMetalPrice(
  symbol: "XAU" | "XAG"
): Promise<MetalPrice> {
  const response = await fetch(
    `https://api.gold-api.com/price/${symbol}`,
    {
      next: {
        revalidate: CACHE_SECONDS,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${symbol} spot price: ${response.status}`
    );
  }

  const data = (await response.json()) as GoldApiResponse;

  const pricePerOunceUsd = parsePrice(data.price, symbol);

  return {
    symbol,
    pricePerOunceUsd,
    pricePerGramUsd:
      pricePerOunceUsd / TROY_OUNCE_TO_GRAM,
  };
}

async function fetchExchangeRate(
  currency: string
): Promise<number> {
  if (currency === "USD") {
    return 1;
  }

  const response = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${currency}`,
    {
      next: {
        revalidate: CACHE_SECONDS,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch USD/${currency} exchange rate: ${response.status}`
    );
  }

  const data =
    (await response.json()) as ExchangeRateResponse;

  const rate = Number(data.rates?.[currency]);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(
      `Invalid USD/${currency} exchange rate`
    );
  }

  return rate;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const currency = (
      searchParams.get("currency") ?? "USD"
    ).toUpperCase();

    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Currency must be a valid 3-letter ISO currency code.",
        },
        { status: 400 }
      );
    }

    const [gold, silver, exchangeRate] =
      await Promise.all([
        fetchMetalPrice("XAU"),
        fetchMetalPrice("XAG"),
        fetchExchangeRate(currency),
      ]);

    const goldNisabUsd =
      gold.pricePerGramUsd * GOLD_NISAB_GRAMS;

    const silverNisabUsd =
      silver.pricePerGramUsd * SILVER_NISAB_GRAMS;

    const goldNisabNative =
      goldNisabUsd * exchangeRate;

    const silverNisabNative =
      silverNisabUsd * exchangeRate;

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
            pricePerOunceUsd:
              gold.pricePerOunceUsd,
            pricePerGramUsd:
              gold.pricePerGramUsd,
          },

          silver: {
            symbol: silver.symbol,
            pricePerOunceUsd:
              silver.pricePerOunceUsd,
            pricePerGramUsd:
              silver.pricePerGramUsd,
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
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[ZAKAT_API_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve current Nisab prices.",
      },
      {
        status: 503,
      }
    );
  }
}