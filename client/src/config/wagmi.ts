import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { type Chain } from "viem";

// Sidrachain definition
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
  },
};

export const config = getDefaultConfig({
  appName: "Sidex",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "dev-placeholder",
  chains: [sidraChain],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
  ssr: true,
});
