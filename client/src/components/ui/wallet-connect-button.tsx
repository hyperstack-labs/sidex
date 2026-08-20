"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ShieldCheck, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Custom RainbowKit Wallet Connect button with SidEx branded styling (#01AACA),
 * network status handling, responsive fullWidth support, and integrated
 * Vault Account details management modal.
 *
 * @param props - Component props
 * @param props.fullWidth - If true, expands button width to 100% (useful in mobile drawers).
 * @returns Connect button interactive element.
 */
export function WalletConnectButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const [vaultAddress, setVaultAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("sidex_vault_address");
    } catch {
      return null;
    }
  });
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    if (vaultAddress) {
      try {
        await navigator.clipboard.writeText(vaultAddress);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy address");
      }
    }
  };

  const handleDisconnect = () => {
    try {
      localStorage.removeItem("sidex_vault_address");
    } catch {}
    setVaultAddress(null);
    setIsAccountOpen(false);
    toast.info("Vault locked. Redirecting to login...");
    router.push("/login");
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        openChainModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <>
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
              })}
              className={fullWidth ? "w-full" : ""}
            >
              {(() => {
                if (!connected) {
                  if (vaultAddress) {
                    return (
                      <button
                        onClick={() => setIsAccountOpen(true)}
                        className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center rounded-full border border-white/15 hover:border-white/30 bg-transparent text-zinc-200 hover:text-white text-xs sm:text-[13px] font-mono px-3.5 h-9 transition-colors cursor-pointer`}
                        title="View Vault Account Details"
                      >
                        <span>
                          {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openConnectModal}
                      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-xl bg-[#01AACA] hover:bg-[#01AACA]/90 text-white text-sm font-semibold px-4 h-9 transition-colors cursor-pointer`}
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center rounded-xl bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold px-4 h-9 transition-colors cursor-pointer`}
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-xl bg-[#01AACA] hover:bg-[#01AACA]/90 text-white text-sm font-semibold px-4 h-9 transition-colors cursor-pointer`}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        className="w-4 h-4 rounded-full shrink-0"
                      />
                    )}
                    <span className="truncate">{account.displayName}</span>
                  </button>
                );
              })()}
            </div>

            {/* Vault Account Details Modal */}
            {vaultAddress && (
              <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
                <DialogContent className="max-w-sm bg-zinc-950/95 border border-white/10 backdrop-blur-2xl text-zinc-100 p-6 rounded-2xl shadow-2xl space-y-4">
                  <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#01AACA]" />
                      <DialogTitle className="text-base font-semibold text-white">
                        Vault Account
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-zinc-400">
                      Connected on Sidra Chain Mainnet (97453)
                    </DialogDescription>
                  </DialogHeader>

                  {/* Address Box */}
                  <div className="bg-transparent border border-white/10 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Account Address</span>
                      <span className="text-zinc-400 font-mono">Active</span>
                    </div>
                    <p className="font-mono text-xs text-zinc-200 break-all select-all leading-relaxed">
                      {vaultAddress}
                    </p>
                  </div>

                  {/* Actions: Copy & Explorer */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopy}
                      className="h-9 border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-200 gap-1.5 rounded-xl cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </Button>

                    <a
                      href={`https://ledger.sidrachain.com/address/${vaultAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-9 border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-200 gap-1.5 rounded-xl transition-colors font-medium cursor-pointer"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                  </div>

                  {/* Secondary Options */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsAccountOpen(false);
                        openConnectModal?.();
                      }}
                      className="w-full h-9 justify-start text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl gap-2 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-[#01AACA]" />
                      <span>Link External Wallet (MetaMask)</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDisconnect}
                      className="w-full h-9 justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Lock Vault & Logout</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
