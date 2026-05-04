import { useEffect, useState } from "react";
import { AUTO_PROMO_MESSAGES } from "../data/aliTerraKnowledge";

export default function AutoPromoTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % AUTO_PROMO_MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const message = AUTO_PROMO_MESSAGES[currentIndex];

  // Strip markdown for display
  const plainText = message
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Extract URL
  const urlMatch = message.match(/\(([^)]+)\)/);
  const url = urlMatch ? urlMatch[1] : "#";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full overflow-hidden cursor-pointer group"
    >
      <div
        className={`px-4 py-2.5 bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-cyan-900/60
          border-b border-purple-500/20 text-center transition-all duration-400
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <p className="text-sm text-purple-200 group-hover:text-white transition-colors duration-200 truncate">
          {plainText}
        </p>
      </div>
    </a>
  );
}
