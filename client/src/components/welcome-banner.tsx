import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, Calculator, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  onClose: () => void;
}

export function WelcomeBanner({ onClose }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/50">
            <CardContent className="relative p-6">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-8">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <h3 className="font-bold">System Status: Operational</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  SidraChain connection established. All compliance modules are active and
                  monitoring real-time transactions.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Compliance Verified</p>
                      <p className="text-xs text-muted-foreground">AAOIFI Standards Met</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 text-accent mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Zakat Calculator</p>
                      <p className="text-xs text-muted-foreground">Auto-calculation Active</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Market Intelligence</p>
                      <p className="text-xs text-muted-foreground">Live Data Feed</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleClose}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
