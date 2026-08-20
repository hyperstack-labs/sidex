"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, ChevronRight, Info, Clipboard } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LoginPageProps {
  onLogin: () => void;
}

/**
 * Modern Institutional Web3 Vault & Authentication screen for SidEx.
 * Features a seamless glassmorphism container that blends into the bottom background,
 * stationary brain emblem, and minimalist typography.
 *
 * @param props - Component props containing login trigger.
 * @returns Login page interactive view.
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");

  const wordsCount = recoveryPhrase
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const handleLogin = () => {
    if (recoveryPhrase.trim()) {
      toast.success("Authentication Successful", {
        description: "Decrypting client-side vault...",
      });
      setTimeout(() => {
        onLogin();
      }, 400);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecoveryPhrase(text.trim());
        toast.success("Recovery phrase pasted from clipboard");
      }
    } catch {
      toast.error("Clipboard access denied. Please paste manually.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100">
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
        className="w-full max-w-lg relative z-10 space-y-4 my-auto py-8"
      >
        {/* Stationary Brain Emblem & SIDEX Logo */}
        <div className="relative flex flex-col items-center justify-center text-center">
          {/* Static Clean 3D Brain Emblem - No pulsating/scaling distortion */}
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
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#01AACA]" />
                <span className="font-medium text-zinc-300">Self-Custodial</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <Info className="w-3.5 h-3.5 cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs max-w-xs p-3">
                    <p>Your private keys remain encrypted locally. SidEx never has access to your credentials or funds.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Secret Recovery Phrase Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium tracking-tight text-zinc-200">Secret Recovery Phrase</label>
                <div className="flex items-center gap-2">
                  {wordsCount > 0 && (
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-white/5">
                      {wordsCount} {wordsCount === 1 ? "word" : "words"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 text-[11px] text-[#01AACA] hover:text-[#01AACA]/80 transition-colors font-medium"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>

              <Textarea
                placeholder="Enter 12 or 24-word seed phrase..."
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                className="min-h-[105px] bg-black/60 border border-white/10 text-sm resize-none font-mono leading-relaxed p-3.5 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:border-[#01AACA]/70 focus:shadow-[0_0_20px_rgba(1,170,202,0.2)] transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
            </div>

            {/* Decrypt Vault Action */}
            <div className="space-y-3 pt-1">
              <Button
                onClick={handleLogin}
                disabled={!recoveryPhrase.trim()}
                className={`w-full h-11 text-sm tracking-wide rounded-xl transition-all duration-200 ${
                  recoveryPhrase.trim()
                    ? "bg-[#01AACA] hover:bg-[#01AACA]/90 text-zinc-950 font-semibold shadow-[0_0_25px_rgba(1,170,202,0.35)] hover:shadow-[0_0_35px_rgba(1,170,202,0.5)] active:scale-[0.99] cursor-pointer"
                    : "bg-zinc-900/90 text-zinc-500 border border-white/5 font-medium cursor-not-allowed shadow-none"
                }`}
              >
                <span>Unlock Wallet</span>
              </Button>

              <div className="text-center pt-0.5">
                <p className="text-xs text-zinc-500">
                  Don&apos;t have a wallet?{" "}
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="text-[#01AACA] hover:text-[#01AACA]/80 font-medium transition-colors hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Minimalist Typographic Footer - No Pill Containers, No Rainbow Dots */}
        <div className="pt-2 text-center">
          <p className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase flex items-center justify-center gap-2">
            <span>End-to-End Encrypted</span>
            <span className="text-zinc-700">•</span>
            <span>AAOIFI Sharia Compliant</span>
            <span className="text-zinc-700">•</span>
            <span>GCC Regulated</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}