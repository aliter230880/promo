import { Campaign } from "../data/aliTerraKnowledge";

interface CampaignCardProps {
  campaign: Campaign;
}

const statusConfig = {
  active: { label: "Активна", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  scheduled: { label: "Запланирована", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  completed: { label: "Завершена", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const status = statusConfig[campaign.status];

  return (
    <div className="relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5
      hover:border-purple-500/30 hover:bg-white/8 transition-all duration-300 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-br from-purple-600/5 to-cyan-600/5" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{campaign.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-400">{campaign.platform}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
          <div className="text-2xl flex-shrink-0">{campaign.icon}</div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs leading-relaxed mb-4">{campaign.description}</p>

        {/* CTA Button */}
        <a
          href={campaign.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-xl text-sm font-medium
            bg-gradient-to-r from-purple-600 to-cyan-600 text-white
            hover:from-purple-500 hover:to-cyan-500 transition-all duration-200
            hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
        >
          <span>🚀</span>
          <span>{campaign.cta}</span>
        </a>
      </div>
    </div>
  );
}
