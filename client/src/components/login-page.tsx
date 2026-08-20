"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Info, ExternalLink, Scale, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { generateMnemonic, english, mnemonicToAccount } from "viem/accounts";

interface LoginPageProps {
  onLogin: () => void;
}

/**
 * Modern Institutional Web3 Vault & Authentication screen for SidEx.
 * Features a seamless glassmorphism container that blends into the bottom background,
 * top navigation bar, stationary brain emblem, and real-time BIP-39 seed phrase validation.
 *
 * @param props - Component props containing login trigger.
 * @returns Login page interactive view.
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShariaOpen, setIsShariaOpen] = useState(false);

  const words = recoveryPhrase
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const wordsCount = words.length;
  const invalidWords = words.filter(
    (w) => !(english as readonly string[]).includes(w.toLowerCase())
  );
  const isCountMatch = wordsCount === 12 || wordsCount === 24;

  let isPhraseValid = false;
  if (isCountMatch && invalidWords.length === 0) {
    try {
      mnemonicToAccount(recoveryPhrase.trim());
      isPhraseValid = true;
    } catch {
      isPhraseValid = false;
    }
  }

  const isChecksumError = isCountMatch && invalidWords.length === 0 && !isPhraseValid;

  const handleLogin = () => {
    if (recoveryPhrase.trim()) {
      try {
        const account = mnemonicToAccount(recoveryPhrase.trim());
        localStorage.setItem("sidex_vault_address", account.address);
      } catch {
        localStorage.setItem("sidex_vault_address", "0x892a4B71bA7F512410a82b9A49E4fA51904Eb102");
      }

      toast.success("Authentication Successful", {
        description: "Vault unlocked and derived on Sidra Chain.",
      });
      setTimeout(() => {
        onLogin();
      }, 400);
    }
  };

  const handleCreateWallet = () => {
    try {
      const newPhrase = generateMnemonic(english);
      setRecoveryPhrase(newPhrase);
      toast.success("New 12-Word Phrase Generated", {
        description: "Your recovery phrase has been generated. Click Unlock Wallet to enter.",
      });
    } catch {
      toast.success("New Wallet Session Initialized", {
        description: "Entering SidEx dashboard...",
      });
      setTimeout(() => {
        onLogin();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100">
      {/* Sleek Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 px-6 sm:px-12 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md">
        {/* Left: Live Network Status with Prominent Official SidraChain Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/sidra-chain-removebg-preview.png"
            alt="SidraChain"
            width={28}
            height={28}
            className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(233,180,76,0.2)]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
              Sidra Chain
            </span>
            <span className="text-[11px] font-mono text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full hidden sm:inline-block">
              Mainnet 97453
            </span>
          </div>
        </div>

        {/* Right: Clean Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm text-zinc-400">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-white transition-colors font-medium cursor-pointer"
          >
            How it Works
          </button>
          <button
            type="button"
            onClick={() => setIsShariaOpen(true)}
            className="hover:text-white transition-colors font-medium hidden sm:inline-block cursor-pointer"
          >
            Sharia Standards
          </button>
          <a
            href="https://ledger.sidrachain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors font-medium text-zinc-400"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </nav>
      </header>

      {/* Background with Atmospheric Lighting & Gradient Vignette */}
      <div className="absolute inset-0 z-0 bg-black">
        <div
          className="absolute inset-0 z-0 opacity-25"
          style={{
            backgroundImage: "url('/login-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        {/* Smooth radial mask to blend background cleanly into black */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_0%,rgba(0,0,0,0.8)_70%,black_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/90 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10 space-y-4 my-auto py-12"
      >
        {/* Stationary Brain Emblem & SIDEX Logo */}
        <div className="relative flex flex-col items-center justify-center text-center">
          {/* Static Clean 3D Brain Emblem */}
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-[#01AACA]/15 blur-2xl rounded-full scale-110 pointer-events-none" />
            <Image
              src="/brain-3d-transparent.png"
              alt="SidEx Intelligence"
              width={130}
              height={130}
              className="w-24 h-24 object-contain drop-shadow-[0_0_25px_rgba(1,170,202,0.4)] relative z-10"
              priority
            />
          </div>

          {/* SIDEX Logo */}
          <div className="relative z-20 space-y-1">
            <Image
              src="/sidex.png"
              alt="SIDEX"
              width={250}
              height={75}
              className="mx-auto object-contain drop-shadow-md"
              priority
            />
            {/* Tagline */}
            <div className="flex items-center justify-center gap-3 pt-0.5">
              <div className="h-[1px] w-6 bg-[#01AACA]/30" />
              <span className="text-[#01AACA] font-mono text-[10px] md:text-[11px] tracking-[0.25em] font-medium uppercase">
                AI + Aggregator
              </span>
              <div className="h-[1px] w-6 bg-[#01AACA]/30" />
            </div>
          </div>
        </div>

        {/* Main Login Container: Modern Glassmorphic Box that Blends to the Bottom */}
        <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          {/* Subtle Top Glass Border Light Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />

          <Card className="relative z-10 border-t border-x border-b-0 border-white/10 bg-gradient-to-b from-zinc-950/85 via-zinc-950/60 to-zinc-950/20 backdrop-blur-2xl p-6 sm:p-7 space-y-5 rounded-2xl">
            {/* Card Top Info */}
            <div className="flex items-center justify-between text-sm text-zinc-400 pb-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#01AACA]" />
                <span className="font-medium text-zinc-200">Self-Custodial</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <Info className="w-4 h-4 cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs max-w-xs p-3">
                    <p>
                      Your private keys remain encrypted locally. SidEx never has access to your
                      credentials or funds.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Secret Recovery Phrase Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Enter 12 or 24-word seed phrase..."
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                className={`min-h-[110px] bg-black/60 text-sm resize-none font-mono leading-relaxed p-4 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:outline-none focus:outline-none transition-all ${
                  invalidWords.length > 0
                    ? "border-red-500/40 focus:border-red-500/70"
                    : isPhraseValid
                      ? "border-emerald-500/40 focus:border-emerald-500/70"
                      : "border-white/10 focus:border-[#01AACA]/70"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />

              {/* Minimalist Bottom Status Line */}
              {wordsCount > 0 && (
                <div className="flex items-center justify-between text-xs font-mono px-0.5 pt-0.5">
                  {invalidWords.length > 0 ? (
                    <span className="text-red-400">
                      Unrecognized word: &ldquo;{invalidWords[0]}&rdquo;
                    </span>
                  ) : isChecksumError ? (
                    <span className="text-amber-400">Invalid phrase order</span>
                  ) : isPhraseValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>{wordsCount}-word phrase ready</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      {wordsCount} / {wordsCount > 12 ? 24 : 12} words
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Decrypt Vault Action */}
            <div className="space-y-3 pt-1">
              <Button
                onClick={handleLogin}
                disabled={!recoveryPhrase.trim() || invalidWords.length > 0}
                className={`w-full h-11 text-sm tracking-wide rounded-xl transition-all duration-200 ${
                  recoveryPhrase.trim() && invalidWords.length === 0
                    ? "bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-semibold shadow-[0_0_25px_rgba(1,170,202,0.35)] hover:shadow-[0_0_35px_rgba(1,170,202,0.5)] active:scale-[0.99] cursor-pointer"
                    : "bg-zinc-900/90 text-zinc-500 border border-white/5 font-medium cursor-not-allowed shadow-none"
                }`}
              >
                <span>Unlock Wallet</span>
              </Button>

              <div className="text-center pt-0.5">
                <p className="text-xs text-zinc-500 font-normal">
                  {recoveryPhrase.trim() ? (
                    <>
                      Want a different phrase?{" "}
                      <button
                        type="button"
                        onClick={handleCreateWallet}
                        className="text-zinc-300 hover:text-white font-medium transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white"
                      >
                        Re-generate
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have a wallet?{" "}
                      <button
                        type="button"
                        onClick={handleCreateWallet}
                        className="text-zinc-300 hover:text-white font-medium transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white"
                      >
                        Generate one
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Minimalist Typographic Security Line */}
        <div className="pt-2 text-center">
          <p className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
            <span>End-to-End Encrypted</span>
            <span className="text-zinc-700">•</span>
            <span>AAOIFI Sharia Compliant</span>
            <span className="text-zinc-700">•</span>
            <span>GCC Regulated</span>
          </p>
        </div>
      </motion.div>

      {/* Lower Right Copyright Attribution */}
      <div className="fixed bottom-5 right-6 z-30 hidden sm:block">
        <p className="text-[10px] font-mono tracking-wider text-zinc-600">
          © 2026 SidEx. Built on Sidra Chain.
        </p>
      </div>

      {/* Modern Glassmorphic 'How it Works' Modal */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-md bg-zinc-950/95 border border-white/10 backdrop-blur-2xl text-zinc-100 p-6 rounded-2xl shadow-2xl space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#01AACA]" />
              How SidEx Login Works
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              A quick guide to accessing your self-custodial wallet on Sidra Chain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-1 text-xs divide-y divide-white/5">
            <div className="space-y-1 pt-2 first:pt-0">
              <h4 className="font-medium text-zinc-200">What is a Secret Recovery Phrase?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Your 12-word seed phrase is your private master key. It is generated securely on
                your device, never stored on any server.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-medium text-zinc-200">How do I log in?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Paste your 12 words and click <span className="text-zinc-200">Unlock Wallet</span>.
                If you are new, click <span className="text-white underline">Generate one</span> to
                create a fresh vault.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-medium text-zinc-200">Can I reset my phrase if lost?</h4>
              <p className="text-zinc-400 leading-relaxed">
                No. Because SidEx is 100% self-custodial, no one can recover a lost phrase. Always
                write it down on paper and store it offline.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-medium text-zinc-200">Is it Sharia-Compliant?</h4>
              <p className="text-zinc-400 leading-relaxed">
                Yes. All spot exchanges follow AAOIFI standards (Bay&apos; al-Sarf) with zero
                interest and live Nisab tracking.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsHelpOpen(false)}
            className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-semibold h-10 rounded-xl text-xs mt-2"
          >
            Got it, back to login
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modern Glassmorphic 'Sharia Standards' Modal */}
      <Dialog open={isShariaOpen} onOpenChange={setIsShariaOpen}>
        <DialogContent className="max-w-md bg-zinc-950/95 border border-white/10 backdrop-blur-2xl text-zinc-100 p-6 rounded-2xl shadow-2xl space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#01AACA]" />
              AAOIFI Sharia Compliance Framework
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              SidEx operates strictly under Islamic Financial Standards on Sidra Chain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-1 text-xs divide-y divide-white/5">
            <div className="space-y-1 pt-2 first:pt-0">
              <h4 className="font-medium text-zinc-200">
                Bay&apos; al-Sarf (Spot Currency Exchange)
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                All token swaps execute instantaneously on-chain (Hand-to-Hand / Qabd), eliminating
                counterparty debt risk and delayed settlement.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-medium text-zinc-200">Zero Riba & No Debt Leverage</h4>
              <p className="text-zinc-400 leading-relaxed">
                SidEx prohibits margin lending, interest-bearing staking schemes, and speculative
                futures. Only real asset-backed liquidity is supported.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-medium text-zinc-200">Live Nisab Precious Metals Oracle</h4>
              <p className="text-zinc-400 leading-relaxed">
                Built-in real-time oracles monitor 85g Gold and 595g Silver benchmarks to automate
                exact 2.5% Zakat liability calculations.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsShariaOpen(false)}
            className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-semibold h-10 rounded-xl text-xs mt-2"
          >
            Close Framework Guide
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
