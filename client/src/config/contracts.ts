import { type Address } from "viem";

/**
 * Deployed contract addresses on Sidra Chain (Chain ID: 97453).
 */
export const CONTRACT_ADDRESSES = {
  factory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
  router: (process.env.NEXT_PUBLIC_ROUTER_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
  sGold: (process.env.NEXT_PUBLIC_SGOLD_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
  sUsd: (process.env.NEXT_PUBLIC_SUSD_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as Address,
};

/**
 * SidExRouter minimal ABI for atomic spot swaps and liquidity management.
 */
export const SIDEX_ROUTER_ABI = [
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

/**
 * Standard ERC-20 ABI for balance and approval queries.
 */
export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
