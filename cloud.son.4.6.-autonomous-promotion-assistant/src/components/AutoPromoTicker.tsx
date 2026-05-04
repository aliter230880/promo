import { useEffect, useState } from "react";
import { AUTO_PROMO_MESSAGES } from "../data/aliTerraKnowledge";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export default function AutoPromoTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % AUTO_PROMO_MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-900/60 to-cyan-900/60 border border-purple-500/20 rounded-xl px-4 py-2.5 mb-4 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-sm flex-shrink-0 animate-pulse">📢</span>
        <p
          className={`text-gray-200 text-xs sm:text-sm truncate transition-opacity duration-400 ${visible ? "opacity-100" : "opacity-0"}`}
        >
          {stripMarkdown(AUTO_PROMO_MESSAGES[index])}
        </p>
      </div>
    </div>
  );
}
