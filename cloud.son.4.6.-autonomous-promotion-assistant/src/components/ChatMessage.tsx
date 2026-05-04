import React from "react";
import { Message, ALITERRA_LINKS } from "../data/aliTerraKnowledge";

interface ChatMessageProps {
  message: Message;
}

function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const elements: React.ReactNode[] = [];
    const remaining = line;
    let keyIndex = 0;

    const regex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        elements.push(remaining.slice(lastIndex, match.index));
      }
      if (match[0].startsWith("**")) {
        elements.push(
          <strong key={`bold-${lineIndex}-${keyIndex++}`} className="font-bold text-purple-300">
            {match[2]}
          </strong>
        );
      } else if (match[0].startsWith("[")) {
        elements.push(
          <a
            key={`link-${lineIndex}-${keyIndex++}`}
            href={match[4]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          >
            {match[3]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      elements.push(remaining.slice(lastIndex));
    }

    parts.push(
      <span key={`line-${lineIndex}`}>
        {elements.length > 0 ? elements : line}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });

  return parts;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base shadow-lg
          ${isUser
            ? "bg-gradient-to-br from-purple-500 to-pink-500"
            : "bg-gradient-to-br from-cyan-500 to-blue-600"
          }`}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg
            ${isUser
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-sm"
              : "bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-sm"
            }`}
        >
          {parseMarkdown(message.content)}
        </div>

        {message.links && message.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.links.map((linkKey) => {
              const link = ALITERRA_LINKS[linkKey as keyof typeof ALITERRA_LINKS];
              if (!link) return null;
              return (
                <a
                  key={linkKey}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                    bg-gradient-to-r from-purple-600/40 to-cyan-600/40 border border-purple-500/30
                    text-purple-200 hover:text-white hover:border-cyan-400/50 transition-all duration-200
                    hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        )}

        <span className="text-xs text-gray-500 px-1">
          {message.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
