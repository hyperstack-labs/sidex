"use client";

import { useAccount, useBalance } from "wagmi";
import { useEnvMode } from "./use-env-mode";

export interface TokenData {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  image: string;
  address?: string;
  decimals: number;
}

const MOCK_TOKENS: TokenData[] = [
  {
    symbol: "SDA",
    name: "Sidra Chain",
    balance: "10,250.50",
    price: 12.19,
    image: "/sidra-chain-removebg-preview.png",
    decimals: 18,
  },
  {
    symbol: "sGOLD",
    name: "Sidra Gold",
    balance: "237.50 g",
    price: 84.20,
    image: "/sidex.png",
    decimals: 18,
  },
  {
    symbol: "sUSD",
    name: "Sidra USD",
    balance: "5,000.00",
    price: 1.00,
    image: "/icon.png",
    decimals: 18,
  },
];

/**
 * Unified Token & Balance Hook for SidEx.
 * Seamlessly resolves between Mock demo data and live on-chain Sidra Chain balances.
 *
 * @returns Array of available tokens with formatted balances and live pricing.
 */
export function useTokens() {
  const { isMockMode } = useEnvMode();
  const { address, isConnected } = useAccount();

  // Real native SDA balance from Sidra Chain (Chain ID: 97453)
  const { data: sdaBalance } = useBalance({
    address: address,
    query: {
      enabled: !isMockMode && isConnected && !!address,
    },
  });

  if (isMockMode || !isConnected) {
    return {
      tokens: MOCK_TOKENS,
      isMockMode: true,
    };
  }

  // Live on-chain formatted tokens
  const formattedTokens: TokenData[] = [
    {
      symbol: "SDA",
      name: "Sidra Chain",
      balance: sdaBalance
        ? Number(sdaBalance.formatted).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })
        : "0.00",
      price: 12.19,
      image: "/sidra-chain-removebg-preview.png",
      decimals: 18,
    },
    {
      symbol: "sGOLD",
      name: "Sidra Gold",
      balance: "0.00 g",
      price: 84.20,
      image: "/sidex.png",
      decimals: 18,
    },
    {
      symbol: "sUSD",
      name: "Sidra USD",
      balance: "0.00",
      price: 1.00,
      image: "/icon.png",
      decimals: 18,
    },
  ];

  return {
    tokens: formattedTokens,
    isMockMode: false,
  };
}
