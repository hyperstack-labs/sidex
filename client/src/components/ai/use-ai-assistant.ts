import { useCallback, useState } from "react";
import { Calculator, FileText, Shield, TrendingUp, type LucideIcon } from "lucide-react";

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  action: string;
}

export const quickActions: QuickAction[] = [
  {
    icon: Shield,
    label: "Compliance Audit",
    description: "Verify asset adherence to AAOIFI standards",
    action: "scan",
  },
  {
    icon: Calculator,
    label: "Zakat Estimation",
    description: "Calculate obligations based on current holdings",
    action: "zakat",
  },
  {
    icon: TrendingUp,
    label: "Market Trends",
    description: "Analyze halal investment opportunities",
    action: "market",
  },
  {
    icon: FileText,
    label: "Transaction Summary",
    description: "Generate legible transaction reports",
    action: "summary",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "SidEx Intelligence Active. Ready for compliance verification and transaction analysis. Please select an operation.",
    timestamp: new Date(),
  },
];

export function useAIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const appendAssistantResponse = useCallback((content: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  }, []);

  const handleQuickAction = useCallback(
    (action: string) => {
      let userMessage = "";
      let assistantResponse = "";

      switch (action) {
        case "scan":
          userMessage = "Initiate Compliance Audit";
          assistantResponse =
            "Audit Results: VERIFIED.\n\n• SidraChain (SDA): AAOIFI Compliant\n• Ethereum (ETH): Compliant\n• Bitcoin (BTC): Compliant\n\nStatus: No prohibited assets detected.";
          break;
        case "zakat":
          userMessage = "Estimate Zakat Obligations";
          assistantResponse =
            "Zakat Calculation Report:\n\n• Total Eligible Assets: $150,000.00\n• Nisab Threshold: $5,430.00 (Met)\n• Zakat Payable (2.5%): $3,750.00\n\nStatus: Payment Pending Distribution.";
          break;
        case "market":
          userMessage = "Analyze Market Trends";
          assistantResponse =
            "Market Intelligence:\n\n• SidraChain (SDA): +12.5% (24h). High liquidity.\n• Sector: Islamic Finance (+18% QTD).\n• Commodities: Gold-backed assets showing stability.\n\nAdvisory: Volatility detected in non-compliant DeFi sectors.";
          break;
        case "summary":
          userMessage = "Generate Transaction Summary";
          assistantResponse =
            "Transaction Log:\n\n• IN: 500 SDA ($6,100) | Origin: 0x742d...\n• OUT: 0.5 ETH ($1,500) | Dest: 0x3f2a...\n• SWAP: 1000 SDA → ETH | Vol: $12,200\n\nAll entries cryptographically verified.";
          break;
        default:
          return;
      }

      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      appendAssistantResponse(assistantResponse);
    },
    [appendAssistantResponse]
  );

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    appendAssistantResponse(
      "Query processing limit reached. For specialized financial rulings, please consult a certified Sharia board. This system provides data analysis only."
    );
  }, [appendAssistantResponse, inputValue]);

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    handleQuickAction,
    handleSendMessage,
  };
}
