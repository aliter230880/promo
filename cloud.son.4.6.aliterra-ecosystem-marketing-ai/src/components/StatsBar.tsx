import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

const BASE_STATS: Stat[] = [
  { label: "Пользователи", value: "128,450", icon: "👥", trend: "+2.4%" },
  { label: "NFT продано", value: "47,293", icon: "🖼️", trend: "+5.1%" },
  { label: "LUX Майнеры", value: "89,120", icon: "⛏️", trend: "+8.7%" },
  { label: "Обменов сегодня", value: "3,891", icon: "🔄", trend: "+12%" },
  { label: "LUX Цена", value: "$0.0847", icon: "💰", trend: "+3.2%" },
];

export default function StatsBar() {
  const [stats, setStats] = useState(BASE_STATS);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          const fluctuation = (Math.random() - 0.45) * 0.1;
          const trendVal = parseFloat(stat.trend.replace(/[^0-9.-]/g, ""));
          const newTrend = (trendVal + fluctuation).toFixed(1);
          return { ...stat, trend: `+${Math.max(0, parseFloat(newTrend)).toFixed(1)}%` };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 scrollbar-hide">
      {stats.map((stat, i) => (
        <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-200">
          <span className="text-base">{stat.icon}</span>
          <div>
            <div className="text-white text-xs font-semibold whitespace-nowrap">{stat.value}</div>
            <div className="text-gray-500 text-xs whitespace-nowrap">{stat.label}</div>
          </div>
          <span className="text-green-400 text-xs font-medium ml-1">{stat.trend}</span>
        </div>
      ))}
    </div>
  );
}
