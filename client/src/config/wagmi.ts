import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { type Chain } from "viem";

/**
 * SidraChain network definition for Viem / Wagmi.
 * Chain ID: 97453, Native Currency: $SDA (18 decimals).
 */
export const sidraChain: Chain = {
  id: 97453,
  name: "SidraChain",
  nativeCurrency: {
    name: "Sidra",
    symbol: "SDA",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://node.sidrachain.com"] },
  },
  blockExplorers: {
    default: { name: "Sidra Explorer", url: "https://explorer.sidrachain.com" },
    blockscout: { name: "Blockscout", url: "https://ledger.sidrachain.com" },
  },
};

/**
 * Global Wagmi & RainbowKit client configuration.
 * Configured with SidraChain, injected/MetaMask wallets, and Next.js SSR hydration support.
 */
export const config = getDefaultConfig({
  appName: "Sidex",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "dev-placeholder",
  chains: [sidraChain],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, injectedWallet],
    },
  ],
  ssr: true,
});

