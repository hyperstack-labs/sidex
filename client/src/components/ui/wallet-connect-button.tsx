"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectButton({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
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
