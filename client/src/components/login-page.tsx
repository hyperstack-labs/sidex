"use client";

import { motion } from "motion/react";
import { ShieldCheck, Scale, Coins, ArrowRight, Lock, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WalletConnectButton } from "@/components/ui/wallet-connect-button";
import { useAccount } from "wagmi";
import { useEffect } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

/**
 * Institutional-grade Web3 onboarding gateway for SidEx.
 * Replaces mock phrase entry with standard, non-custodial wallet connection
 * and AAOIFI Sharia compliance protocol indicators.
 *
 * @param props - Component properties containing login callback.
 * @returns Onboarding gateway element.
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  const { isConnected } = useAccount();

  // Automatically advance to dashboard when user successfully connects wallet
  useEffect(() => {
    if (isConnected) {
      onLogin();
    }
  }, [isConnected, onLogin]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100">
      {/* Refined subtle ambient lighting - No cartoonish glows */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(1,170,202,0.12),transparent_70%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_90%,rgba(16,185,129,0.04),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SidraChain Mainnet (ID: 97453)
          </div>

          <div className="pt-2">
            <Image
              src="/sidex.png"
              alt="SidEx Protocol"
              width={220}
              height={70}
              className="mx-auto object-contain"
              priority
            />
          </div>

          <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Institutional Islamic DeFi protocol for spot liquidity exchange, real-time Nisab oracles, and automated Zakat settlement.
          </p>
        </div>

        {/* Primary Action Card */}
        <Card className="border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-6 shadow-2xl rounded-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-white">Connect Web3 Wallet</h2>
              <p className="text-xs text-zinc-400">
                Authenticate securely with your non-custodial wallet to access your portfolio and execute spot swaps.
              </p>
            </div>

            {/* Wallet Connect Primary Action */}
            <div className="pt-2">
              <WalletConnectButton fullWidth />
            </div>

            {/* Read-Only Explore Mode */}
            <div className="pt-1 text-center">
              <Button
                variant="ghost"
                onClick={onLogin}
                className="w-full text-xs text-zinc-400 hover:text-white hover:bg-zinc-900/60 h-9 font-medium"
              >
                <span>Browse Protocol (Read-Only Mode)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-60" />
              </Button>
            </div>
          </div>

          {/* Core Guarantees Grid */}
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-1">
              <Scale className="w-4 h-4 text-[#01AACA] mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Zero Riba</p>
              <p className="text-[10px] text-zinc-400">Spot AMM Only</p>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-1">
              <Coins className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Live Nisab</p>
              <p className="text-[10px] text-zinc-400">Gold/Silver Oracles</p>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-1">
              <Lock className="w-4 h-4 text-zinc-300 mx-auto" />
              <p className="text-[11px] font-semibold text-zinc-200">Self-Custodial</p>
              <p className="text-[10px] text-zinc-400">Client Encrypted</p>
            </div>
          </div>
        </Card>

        {/* Sharia Governance & Security Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AAOIFI Standards Compliant</span>
          </div>

          <a
            href="https://ledger.sidrachain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
          >
            <span>Sidra Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}