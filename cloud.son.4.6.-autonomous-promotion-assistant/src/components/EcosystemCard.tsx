import { ALITERRA_LINKS, LinkKey } from "../data/aliTerraKnowledge";

interface EcosystemCardProps {
  linkKey: LinkKey;
  gradient: string;
}

export default function EcosystemCard({ linkKey, gradient }: EcosystemCardProps) {
  const link = ALITERRA_LINKS[linkKey];
  if (!link) return null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl flex flex-col items-center gap-2
        hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer group
        hover:shadow-xl hover:shadow-purple-500/20`}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
      <span className="text-white font-medium text-xs text-center leading-tight">{link.label}</span>
      <span className="text-white/60 text-[10px] text-center leading-tight hidden sm:block">{link.desc}</span>
    </a>
  );
}
