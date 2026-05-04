interface EcosystemCardProps {
  icon: string;
  label: string;
  desc: string;
  url: string;
  gradient: string;
  glowColor: string;
}

export default function EcosystemCard({ icon, label, desc, url, gradient, glowColor }: EcosystemCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10
        bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300
        hover:scale-105 hover:border-white/20 cursor-pointer overflow-hidden`}
      style={{ boxShadow: `0 0 0 0 ${glowColor}`, transition: "all 0.3s ease" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px 2px ${glowColor}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${glowColor}`;
      }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${gradient} shadow-lg`}>
        {icon}
      </div>
      <div className="text-center">
        <div className="text-white text-sm font-semibold">{label}</div>
        <div className="text-gray-400 text-xs mt-0.5">{desc}</div>
      </div>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 ${gradient} transition-opacity duration-300`} />
    </a>
  );
}
