import { useState } from "react";
import { motion } from "motion/react";
import { Shield, ChevronRight, Info, Lock } from "lucide-react";
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
 * Main Login & Onboarding component for SidEx.
 *
 * @param props - Component props containing login trigger.
 * @returns Login page view.
 */
export function LoginPage({ onLogin }: LoginPageProps) {
  const [recoveryPhrase, setRecoveryPhrase] = useState("");

  const handleLogin = () => {
    if (recoveryPhrase.trim()) {
      toast.success("Authentication Successful", {
        description: "Decrypting vault...",
      });
      setTimeout(() => {
        onLogin();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background with Overlay & Gradient Fade */}
      <div className="absolute inset-0 z-0 bg-black">
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage: "url('/login-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        {/* Gradient Mask to fade bottom into black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Hero Graphic - Restored Brain + Loop */}
        <div className="relative flex flex-col items-center justify-center mb-0">

          {/* Top: Digital Brain (Restored) */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20"
          >
            {/* Glow Behind - #01AACA */}
            <div className="absolute inset-0 bg-[#01AACA]/20 blur-3xl rounded-full scale-125 animate-pulse" />
            <Image
              src="/brain-3d-transparent.png"
              alt="SidEx Intelligence"
              width={180}
              height={180}
              className="w-36 h-36 object-contain drop-shadow-[0_0_40px_rgba(1,170,202,0.6)]"
              priority
            />
            {/* Neural Data Connection Beam - #01AACA */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-[#01AACA] via-[#5EEad4] to-transparent z-[-1]">
              <div className="absolute inset-0 animate-pulse bg-[#01AACA] blur-[1px]" />
            </div>
            {/* Particle flow down the line - #01AACA */}
            <motion.div
              className="absolute top-[80%] left-1/2 -translate-x-1/2 w-1 h-2 bg-white rounded-full shadow-[0_0_10px_#01AACA]"
              animate={{ y: [0, 80], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Middle: Infinite Loop */}
          <div className="relative w-full h-24 flex items-center justify-center -mt-14 mb-4 perspective-[1000px] z-10">
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotateX(20deg) scale(0.9)" }}>
              <svg width="280" height="120" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                <defs>
                  <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#01AACA" stopOpacity="0" />
                    <stop offset="30%" stopColor="#01AACA" stopOpacity="1" />
                    <stop offset="70%" stopColor="#01AACA" stopOpacity="1" />
                    <stop offset="100%" stopColor="#01AACA" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Base Track */}
                <path
                  d="M150,60 C110,60 70,10 30,60 C70,110 110,60 150,60 Z"
                  fill="none"
                  stroke="#052029"
                  strokeWidth="6"
                  strokeOpacity="0.4"
                />

                {/* Glowing Core Path - #01AACA */}
                <motion.path
                  d="M150,60 C110,60 70,10 30,60 C70,110 110,60 150,60 Z"
                  fill="none"
                  stroke="#01AACA"
                  strokeWidth="2"
                  filter="url(#glow-cyan)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Animated Stream */}
                <motion.path
                  d="M150,60 C110,60 70,10 30,60 C70,110 110,60 150,60 Z"
                  fill="none"
                  stroke="url(#streamGradient)"
                  strokeWidth="3"
                  strokeDasharray="40 160"
                  animate={{ strokeDashoffset: [0, -400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>
          </div>

          {/* Main Logo */}
          <div className="relative z-20 text-center -mt-6 mb-6">
            <Image
              src="/sidex.png"
              alt="SIDEX"
              width={300}
              height={100}
              className="mx-auto object-contain"
              priority
            />
            {/* Tagline */}
            <div className="flex items-center justify-center gap-3 mt-0">
              <div className="h-[1px] w-8 bg-[#01AACA]/50" />
              <span className="text-[#01AACA] font-mono text-xs md:text-sm tracking-[0.4em] font-bold uppercase drop-shadow-md">
                AI + Aggregator
              </span>
              <div className="h-[1px] w-8 bg-[#01AACA]/50" />
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-1 backdrop-blur-2xl bg-black/60 border border-white/10 shadow-2xl overflow-hidden rounded-xl">
          <div className="bg-zinc-950/50 p-6 rounded-lg space-y-6">

            {/* Top Banner / Info */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#01AACA]" />
                <span className="font-medium text-zinc-300">Non-Custodial</span>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 hover:text-white transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300 max-w-xs">
                      <p>You have full control. Your private keys remain encrypted on your device, meaning we cannot access or freeze your funds.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Recovery Phrase Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-zinc-200">
                  Secret Recovery Phrase
                </label>
                <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  Security Verified
                </div>
              </div>

              <Textarea
                placeholder="Enter your 12 or 24 word recovery phrase separated by spaces..."
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                className="min-h-[120px] bg-black/50 border-zinc-700 focus:border-[#01AACA]/50 focus:ring-1 focus:ring-[#01AACA]/50 text-base resize-none font-mono leading-relaxed p-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
              />
              <p className="text-xs text-zinc-500 px-1">
                Ensure no one is looking at your screen.
              </p>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!recoveryPhrase.trim()}
              className="w-full bg-[#01AACA] hover:bg-[#01AACA]/90 text-black font-bold h-12 text-base shadow-[0_0_20px_rgba(1,170,202,0.2)] transition-all hover:shadow-[0_0_30px_rgba(1,170,202,0.4)]"
            >
              <span>Decrypt Vault</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Create New Wallet */}
            <div className="text-center pt-2">
              <Button variant="link" className="text-zinc-400 hover:text-white text-xs">
                Create New Wallet
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500/80 uppercase tracking-widest"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            End-to-end encrypted
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            Sharia-compliant
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
            GCC Regulated
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}