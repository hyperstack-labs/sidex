import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Copy, QrCode, CheckCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepositPageProps {
  onBack: () => void;
}

const tokens = [
  { symbol: "SDA", name: "SidraChain", network: "SidraChain Mainnet" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum Mainnet" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network" },
];

export function DepositPage({ onBack }: DepositPageProps) {
  const [selectedToken, setSelectedToken] = useState("SDA");
  const [copied, setCopied] = useState(false);

  // Mock wallet address
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f3a8f";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken);

  return (
    <div className="space-y-6 pb-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-emerald-500/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              Receive {selectedToken}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Token</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-input border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex flex-col">
                        <span>
                          {token.name} ({token.symbol})
                        </span>
                        <span className="text-xs text-muted-foreground">{token.network}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center p-8">
              <div className="relative">
                <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
                  {/* QR Code would be generated here */}
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  </div>
                </div>
                {/* Badge overlay */}
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Halal ✓
                  </Badge>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Wallet Address</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm break-all">
                  {walletAddress}
                </div>
                <Button
                  onClick={handleCopyAddress}
                  variant="outline"
                  size="icon"
                  className={`shrink-0 ${
                    copied ? "bg-emerald-500/20 border-emerald-500/30" : "border-primary/20"
                  }`}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Network Info */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Network: {selectedTokenData?.network}
              </h4>
              <p className="text-sm text-muted-foreground">
                Only send {selectedToken} tokens to this address. Sending other tokens may result in
                permanent loss.
              </p>
            </div>

            {/* Important Notes */}
            <div className="space-y-3">
              <h4 className="font-medium">Important Notes:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Minimum deposit: 0.01 {selectedToken}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Deposits require 12 network confirmations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>This address is non-custodial. You have full control of your keys.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>
                    All incoming transactions are automatically checked for Sharia compliance
                  </span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="border-primary/20" onClick={handleCopyAddress}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              <Button variant="outline" className="border-primary/20">
                <Download className="w-4 h-4 mr-2" />
                Save QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Deposits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold mb-4">Recent Deposits</h3>
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent deposits</p>
              <p className="text-sm mt-1">Your deposits will appear here once confirmed</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
