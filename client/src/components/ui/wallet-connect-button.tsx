"use client";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Custom RainbowKit Wallet Connect button with SidEx branded styling (#01AACA),
 * network status handling, and responsive fullWidth support.
 * Synchronizes with in-memory derived vault sessions.
 *
 * @param props - Component props
 * @param props.fullWidth - If true, expands button width to 100% (useful in mobile drawers).
 * @returns Connect button interactive element.
 */
export function WalletConnectButton({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  const [vaultAddress, setVaultAddress] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidex_vault_address");
      if (stored) setVaultAddress(stored);
    } catch {}
  }, []);

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
                      onClick={openConnectModal}
                      className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-white/25 text-white text-xs font-mono px-3.5 h-9 transition-colors cursor-pointer`}
                      title="Active Vault Session. Click to link MetaMask/WalletConnect."
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>
                        {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openConnectModal}
                    className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-xl bg-[#01AACA] hover:bg-[#01AACA]/90 text-white text-sm font-semibold px-4 h-9 transition-colors`}
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center rounded-xl bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold px-4 h-9 transition-colors`}
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  className={`${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-xl bg-[#01AACA] hover:bg-[#01AACA]/90 text-white text-sm font-semibold px-4 h-9 transition-colors`}
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
        );
      }}
    </ConnectButton.Custom>
  );
}
