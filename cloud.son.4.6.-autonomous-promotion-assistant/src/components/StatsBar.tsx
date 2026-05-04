import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: string;
  icon: string;
  growth?: string;
}

const INITIAL_STATS: Stat[] = [
  { label: "Пользователей",  value: "24 800",   icon: "👥", growth: "+12%" },
  { label: "NFT продано",    value: "8 340",    icon: "🖼️", growth: "+8%"  },
  { label: "LUX добыто",     value: "1.2M",     icon: "⛏️", growth: "+34%" },
  { label: "Объём торгов",   value: "$540K",    icon: "📈", growth: "+19%" },
];

export default function StatsBar() {
  const [stats, setStats] = useState(INITIAL_STATS);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats((prev) =>
        prev.map((s) => {
          const bump = Math.random() > 0.5;
          if (!bump) return s;
          // Slightly randomise the growth label
          const g = (Math.random() * 5 + 5).toFixed(0);
          return { ...s, growth: `+${g}%` };
        })
      );
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1 hover:border-purple-500/30 transition-colors"
        >
          <span className="text-xl">{stat.icon}</span>
          <span className="text-white font-bold text-base">{stat.value}</span>
          <span className="text-gray-400 text-xs">{stat.label}</span>
          {stat.growth && (
            <span className="text-green-400 text-xs font-medium">{stat.growth} ↑</span>
          )}
        </div>
      ))}
    </div>
  );
}
