import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@coinbase/cdp-sdk", "@base-org/account", "@x402/core", "@x402/svm"],
};

export default nextConfig;
