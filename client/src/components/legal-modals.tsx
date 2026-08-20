import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  type: "tos" | "privacy" | null;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  return (
    <Dialog open={type !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{type === "tos" ? "Terms of Service" : "Privacy Policy"}</DialogTitle>
          <DialogDescription>Last Updated: January 2026</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {type === "tos" ? <TermsOfService /> : <PrivacyPolicy />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
        <p className="text-muted-foreground">
          By accessing or using the SidEx Wallet, you agree to be bound by these Terms of Service.
          SidEx provides a non-custodial software interface for the SidraChain ecosystem. We do not
          provide financial advice or brokerage services.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Non-Custodial Nature</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            <strong>User Responsibility:</strong> SidEx does not store your private keys, recovery
            phrases, or passwords. You are solely responsible for the security of your &quot;Secret
            Recovery Phrase.&quot;
          </li>
          <li>
            <strong>No Recovery:</strong> If you lose your recovery phrase, SidEx cannot recover
            your funds. You acknowledge that blockchain transactions are irreversible.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Sharia Compliance Disclaimer</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            <strong>Tools, Not Fatwas:</strong> The Zakat calculator and Halal indicators are
            automated tools provided for convenience. They do not constitute a formal
            &quot;Fatwa.&quot;
          </li>
          <li>
            <strong>User Discretion:</strong> Users are responsible for final verification of their
            religious obligations with qualified Sharia scholars.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Prohibited Activities</h3>
        <p className="text-muted-foreground mb-2">Users agree not to use SidEx for:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>Money laundering or financing of illegal activities.</li>
          <li>
            Interacting with tokens or platforms that promote Riba (usury), gambling, or other
            prohibited industries (Haraam).
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Limitation of Liability</h3>
        <p className="text-muted-foreground">
          SidEx is provided &quot;as is.&quot; We are not liable for any losses resulting from
          SidraChain network congestion, software bugs, or third-party API failures (e.g.,
          CoinGecko).
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Jurisdiction</h3>
        <p className="text-muted-foreground">
          This agreement is governed by the laws of Qatar, Dubai, and GCC countries, as applicable.
          Any disputes shall be resolved in accordance with the regulations of these jurisdictions.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Modifications</h3>
        <p className="text-muted-foreground">
          SidEx reserves the right to modify these Terms at any time. Continued use of the platform
          constitutes acceptance of the updated Terms.
        </p>
      </section>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-semibold mb-2">1. Information Collection</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            <strong>No Personal Data:</strong> SidEx does not require an account, email, or phone
            number to function. We do not collect your name or physical address.
          </li>
          <li>
            <strong>Public Blockchain Data:</strong> We view your public wallet address to display
            balances via the SidraChain API, but we do not link this to your real-world identity.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Use of Third-Party APIs</h3>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
          <li>
            <strong>CoinGecko:</strong> We use the CoinGecko API for real-time price tracking. No
            user-identifiable data is shared with CoinGecko during this process.
          </li>
          <li>
            <strong>SidraChain:</strong> Your transaction data is broadcast directly to the
            SidraChain nodes to ensure decentralization.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Local Storage</h3>
        <p className="text-muted-foreground">
          Your private keys and Zakat settings are stored locally on your device using
          industry-standard encryption. This data never leaves your device and is not uploaded to
          SidEx servers.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. AI Assistant Interaction</h3>
        <p className="text-muted-foreground">
          If you use the Sharia AI Assistant, queries are processed anonymously. We do not store
          chat logs linked to your wallet address.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Security</h3>
        <p className="text-muted-foreground">
          We implement high-level encryption to protect the app interface, but the ultimate security
          of the assets rests with the user&apos;s device security and seed phrase management.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Data Protection Compliance</h3>
        <p className="text-muted-foreground">
          SidEx follows a &quot;Privacy by Design&quot; approach and is committed to compliance with
          GDPR and GCC data protection regulations where applicable.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Your Rights</h3>
        <p className="text-muted-foreground">
          Since we do not collect personal data, there is no data to request, modify, or delete.
          Your wallet data remains entirely under your control on your device.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">8. Contact</h3>
        <p className="text-muted-foreground">
          For privacy-related questions or concerns, please contact us through our official
          channels. We are committed to protecting your privacy and ensuring transparency in our
          operations.
        </p>
      </section>
    </div>
  );
}
