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
    icon: Calculator,
    label: "Calculate Zakat",
    description: "Estimate obligations based on 85g gold Nisab",
    action: "zakat",
  },
  {
    icon: Shield,
    label: "Sharia Compliance",
    description: "Verify AAOIFI standards for SDA, sGOLD, & sUSD",
    action: "compliance",
  },
  {
    icon: TrendingUp,
    label: "Market Overview",
    description: "Live prices for gold and Sidra Chain assets",
    action: "market",
  },
  {
    icon: FileText,
    label: "Audit Rules",
    description: "Bay' al-Sarf spot exchange guidelines",
    action: "rules",
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "How can I assist your portfolio today? You can ask me to estimate your Zakat, review Sharia asset backing, or verify on-chain swap rates on Sidra Chain.",
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
    }, 1100);
  }, []);

  const handleQuickAction = useCallback(
    (action: string) => {
      let userMessage = "";
      let assistantResponse = "";

      switch (action) {
        case "zakat":
          userMessage = "Calculate my Zakat obligations";
          assistantResponse =
            "Zakat Estimation Report (Sidra Chain):\n\n• Gold Nisab Benchmark: $7,157.00 (85g 24K Gold @ $84.20/g)\n• Status: Nisab Met\n• Zakat Rate: 2.50% (Lunar Calendar)\n\nZakat applies to your liquid holdings in SDA, physical sGOLD, and sUSD held for a full Hawl (1 lunar year). Non-liquid infrastructure gas reserves may be exempt.";
          break;
        case "compliance":
          userMessage = "Is my portfolio Sharia compliant?";
          assistantResponse =
            "Sharia Audit Summary:\n\n• $SDA: Verified native Layer 1 utility & validator asset\n• $sGOLD: Verified AAOIFI Standard No. 59 physical allocated 24K gold\n• $sUSD: 1:1 fully reserve-backed stable settlement currency\n\nAll trading pairs operate under Bay' al-Sarf (instant spot exchange) with zero interest (Riba) or speculative leverage (Gharar).";
          break;
        case "market":
          userMessage = "Show live market rates";
          assistantResponse =
            "Live Market Rates (Sidra Chain Mainnet):\n\n• SDA / USD: $12.19\n• sGOLD / USD: $84.20 / gram\n• sUSD / USD: $1.00\n\nAll trades execute atomically on SidExRouter.sol with guaranteed physical backing.";
          break;
        case "rules":
          userMessage = "Explain Bay' al-Sarf rules";
          assistantResponse =
            "Bay' al-Sarf (Currency & Precious Metal Exchange Rules):\n\n1. Instant Hand-to-Hand Delivery (Taqabud): Settlement must occur atomically in the same transaction block.\n2. Equal Value for Same Genus: Exchanging gold for gold requires equal weight.\n3. Zero Deferred Settlement: Futures and forward contracts are strictly prohibited.";
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

    const query = inputValue.toLowerCase();
    let reply =
      "Your query has been analyzed against Sidra Chain smart contracts and AAOIFI Sharia standards. If you need a formal Islamic ruling (Fatwa), please consult your local certified Sharia advisory board.";

    if (query.includes("zakat") || query.includes("nisab")) {
      reply =
        "Zakat on Sidra Chain is calculated based on the 85g gold Nisab ($7,157.00). If your net SDA, sGOLD, and sUSD holdings exceed this threshold for 1 lunar year, 2.5% is payable.";
    } else if (query.includes("gold") || query.includes("sgold")) {
      reply =
        "Sidra Gold ($sGOLD) represents 1 gram of 24K allocated physical gold stored in certified vaults, conforming strictly to AAOIFI Sharia Standard No. 59.";
    } else if (query.includes("swap") || query.includes("trade") || query.includes("sda")) {
      reply =
        "Swaps on SidEx are powered by SidExRouter.sol. Transactions execute atomically on Sidra Chain with instant settlement (Bay' al-Sarf) and zero interest.";
    }

    appendAssistantResponse(reply);
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
