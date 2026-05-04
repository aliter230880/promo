import { Campaign } from "../data/aliTerraKnowledge";

interface CampaignCardProps {
  campaign: Campaign;
}

const STATUS_MAP = {
  active:    { label: "Активна",      color: "bg-green-500/20 text-green-400 border-green-500/30" },
  scheduled: { label: "Запланирована", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  completed: { label: "Завершена",    color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const status = STATUS_MAP[campaign.status];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{campaign.icon}</span>
          <div>
            <h3 className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">{campaign.title}</h3>
            <span className="text-xs text-gray-400">{campaign.platform}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${status.color}`}>
          {status.label}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-4">{campaign.description}</p>

      {campaign.stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {campaign.stats.map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-2 text-center">
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <a
        href={campaign.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center py-2.5 rounded-xl text-sm font-medium
          bg-gradient-to-r from-purple-600 to-cyan-600 text-white
          hover:from-purple-500 hover:to-cyan-500 transition-all duration-200
          hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02]"
      >
        {campaign.cta} →
      </a>
    </div>
  );
}
