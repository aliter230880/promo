import { useState, useRef, useEffect, useCallback } from "react";
import {
  Message,
  ALITERRA_LINKS,
  CAMPAIGNS,
  AUTO_PROMO_MESSAGES,
  generateAIResponse,
} from "./data/aliTerraKnowledge";
import ChatMessage from "./components/ChatMessage";
import EcosystemCard from "./components/EcosystemCard";
import CampaignCard from "./components/CampaignCard";
import AutoPromoTicker from "./components/AutoPromoTicker";
import StatsBar from "./components/StatsBar";

type Tab = "chat" | "ecosystem" | "campaigns" | "promo";

const ECOSYSTEM_CARDS = [
  { key: "mainWorld", gradient: "bg-gradient-to-br from-purple-600 to-indigo-700", glowColor: "rgba(139,92,246,0.4)" },
  { key: "nft", gradient: "bg-gradient-to-br from-pink-600 to-purple-700", glowColor: "rgba(236,72,153,0.4)" },
  { key: "wallet", gradient: "bg-gradient-to-br from-blue-600 to-cyan-700", glowColor: "rgba(59,130,246,0.4)" },
  { key: "walletBot", gradient: "bg-gradient-to-br from-cyan-600 to-teal-700", glowColor: "rgba(6,182,212,0.4)" },
  { key: "exchange", gradient: "bg-gradient-to-br from-green-600 to-emerald-700", glowColor: "rgba(34,197,94,0.4)" },
  { key: "exchangeBot", gradient: "bg-gradient-to-br from-yellow-600 to-orange-700", glowColor: "rgba(234,179,8,0.4)" },
  { key: "cryptoExchange", gradient: "bg-gradient-to-br from-orange-600 to-red-700", glowColor: "rgba(249,115,22,0.4)" },
  { key: "messenger", gradient: "bg-gradient-to-br from-violet-600 to-purple-700", glowColor: "rgba(124,58,237,0.4)" },
  { key: "telegram", gradient: "bg-gradient-to-br from-sky-500 to-blue-600", glowColor: "rgba(14,165,233,0.4)" },
  { key: "miner", gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", glowColor: "rgba(245,158,11,0.4)" },
];

const QUICK_QUESTIONS = [
  "Как начать в AliTerra?",
  "Как заработать LUX?",
  "Что такое NFT?",
  "Как работает майнинг?",
  "Как обменять крипту?",
  "Расскажи об AliTerra",
];

const TYPING_SPEED = 18; // ms per character

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content: `👋 Привет! Я **AliBot** — ваш автономный ИИ помощник метавселенной **AliTerra**!\n\nЯ помогу вам:\n🌐 Узнать всё о метавселенной\n⛏️ Начать майнинг LUX токенов\n🖼️ Найти лучшие NFT\n💱 Обменять криптовалюту\n📈 Торговать на HEX бирже\n💬 Общаться в крипто-мессенджере\n\nЖивите, играйте и зарабатывайте в мире безграничных возможностей! Чем могу помочь?`,
      timestamp: new Date(),
      links: ["mainWorld", "miner", "nft", "telegram"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [autoPromoIndex, setAutoPromoIndex] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Autonomous AI promotion mode
  const sendAutoPromo = useCallback(() => {
    if (isTyping) return;
    const promoMessages = [
      { q: "Как заработать в AliTerra?", delay: 0 },
      { q: "Расскажи об NFT", delay: 0 },
      { q: "Как работает майнинг?", delay: 0 },
      { q: "Что такое LuxEx обменник?", delay: 0 },
      { q: "Как начать в AliTerra?", delay: 0 },
    ];
    const msg = promoMessages[autoPromoIndex % promoMessages.length];
    setAutoPromoIndex((p) => p + 1);
    handleSendMessage(msg.q, true);
  }, [autoPromoIndex, isTyping]);

  useEffect(() => {
    if (isAutoMode && tab === "chat") {
      autoIntervalRef.current = setInterval(() => {
        sendAutoPromo();
      }, 12000);
    }
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [isAutoMode, sendAutoPromo, tab]);

  const handleSendMessage = (text: string, isAuto = false) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: isAuto ? `[Авто-промо] ${trimmed}` : trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    const thinkDelay = 800 + Math.random() * 600;
    setTimeout(() => {
      const { text: responseText, suggestedLinks } = generateAIResponse(trimmed);

      // Typewriter effect
      let displayed = "";
      const chars = responseText.split("");
      let charIndex = 0;

      const aiMsgId = generateId();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        links: suggestedLinks,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      const typeInterval = setInterval(() => {
        if (charIndex < chars.length) {
          displayed += chars[charIndex];
          charIndex++;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsgId ? { ...m, content: displayed } : m))
          );
        } else {
          clearInterval(typeInterval);
        }
      }, TYPING_SPEED);
    }, thinkDelay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "chat", label: "ИИ Чат", icon: "🤖" },
    { id: "ecosystem", label: "Экосистема", icon: "🌐" },
    { id: "campaigns", label: "Кампании", icon: "🚀" },
    { id: "promo", label: "Авто-промо", icon: "📣" },
  ];

  return (
    <div className="min-h-screen bg-[#080820] text-white overflow-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full
          bg-gradient-to-br from-purple-900/30 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full
          bg-gradient-to-br from-cyan-900/25 to-transparent blur-[100px]"
          style={{ animationDelay: "2s", animation: "pulse 4s ease-in-out infinite" }} />
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full
          bg-gradient-to-br from-blue-900/20 to-transparent blur-[80px]"
          style={{ animation: "pulse 6s ease-in-out infinite" }} />
        {/* Stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex flex-col h-screen max-h-screen">

        {/* Header */}
        <header className="flex-shrink-0 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <AutoPromoTicker />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-5 h-0.5 bg-white mb-1" />
                <div className="w-5 h-0.5 bg-white mb-1" />
                <div className="w-5 h-0.5 bg-white" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/30">
                  A
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-wide"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    AliTerra AI
                  </h1>
                  <p className="text-xs text-purple-400">Автономный ИИ помощник</p>
                </div>
              </div>
            </div>

            {/* Auto mode toggle */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-green-500/10 border border-green-500/20">
                <div className={`w-2 h-2 rounded-full ${isAutoMode ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
                <span className="text-xs text-green-400">
                  {isAutoMode ? "Авто-режим вкл." : "Авто-режим выкл."}
                </span>
              </div>
              <button
                onClick={() => setIsAutoMode(!isAutoMode)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isAutoMode
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600"
                  : "bg-gray-700"
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isAutoMode ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-white/5">
            <StatsBar />
          </div>

          {/* Tabs */}
          <div className="flex border-t border-white/5 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-3 text-xs font-medium
                  transition-all duration-200 relative
                  ${tab === t.id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                  }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                {tab === t.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500" />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-hidden flex">

          {/* Sidebar - desktop only */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-black/90 backdrop-blur-xl border-r border-white/10
            transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 lg:block
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto
          `}>
            <div className="p-4 pt-16 lg:pt-4">
              {/* Hero image */}
              <div className="rounded-xl overflow-hidden mb-4 aspect-video relative">
                <img
                  src="/images/aliterra-hero.jpg"
                  alt="AliTerra Metaverse"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-semibold leading-tight"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    AliTerra Metaverse
                  </p>
                  <p className="text-purple-300 text-xs">Живи. Играй. Зарабатывай.</p>
                </div>
              </div>

              {/* AI Avatar */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <img
                  src="/images/ai-avatar.png"
                  alt="AliBot"
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                />
                <div>
                  <div className="text-white font-semibold text-sm">AliBot</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs">Онлайн</span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Быстрые ссылки</p>
                {Object.entries(ALITERRA_LINKS).map(([key, link]) => (
                  <a
                    key={key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-300
                      hover:bg-white/10 hover:text-white transition-all duration-200 group"
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="flex-1 text-xs">{link.label}</span>
                    <svg className="w-3 h-3 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* CHAT TAB */}
            {tab === "chat" && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm shadow-lg">
                        🤖
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick questions */}
                <div className="flex-shrink-0 px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendMessage(q)}
                        disabled={isTyping}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
                          bg-purple-900/40 border border-purple-500/30 text-purple-300
                          hover:bg-purple-800/50 hover:text-white hover:border-purple-400/50
                          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Спросите об AliTerra..."
                      disabled={isTyping}
                      className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500
                        bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none
                        focus:bg-white/8 transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !input.trim()}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600
                        text-white font-medium hover:from-purple-500 hover:to-cyan-500
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ECOSYSTEM TAB */}
            {tab === "ecosystem" && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    🌐 Экосистема AliTerra
                  </h2>
                  <p className="text-gray-400 text-sm">Весь мир возможностей в одном месте</p>
                </div>

                {/* Hero banner */}
                <div className="relative rounded-2xl overflow-hidden mb-6 h-36 sm:h-48">
                  <img
                    src="/images/aliterra-hero.jpg"
                    alt="AliTerra"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-6">
                    <p className="text-2xl sm:text-3xl font-black text-white mb-1"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      AliTerra
                    </p>
                    <p className="text-purple-300 text-sm sm:text-base">Живи. Играй. Зарабатывай.</p>
                    <a
                      href="https://aliterra.space/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                        bg-gradient-to-r from-purple-600 to-cyan-600 text-white w-fit
                        hover:from-purple-500 hover:to-cyan-500 transition-all duration-200 hover:scale-105"
                    >
                      🚀 Войти в мир
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {ECOSYSTEM_CARDS.map(({ key, gradient, glowColor }) => {
                    const link = ALITERRA_LINKS[key as keyof typeof ALITERRA_LINKS];
                    if (!link) return null;
                    return (
                      <EcosystemCard
                        key={key}
                        icon={link.icon}
                        label={link.label}
                        desc={link.desc}
                        url={link.url}
                        gradient={gradient}
                        glowColor={glowColor}
                      />
                    );
                  })}
                </div>

                {/* Info section */}
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span>🎮</span> О метавселенной
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      AliTerra — революционная метавселенная, объединяющая игровой мир, DeFi экосистему, NFT маркетплейс
                      и криптовалютную инфраструктуру. Мир безграничных возможностей!
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/20">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <span>💡</span> Как начать
                    </h3>
                    <ol className="text-gray-400 text-sm space-y-1">
                      <li>1. 🌐 Войди на aliterra.space</li>
                      <li>2. 💼 Создай кошелёк</li>
                      <li>3. 🖼️ Купи первый NFT</li>
                      <li>4. ⛏️ Запусти майнер</li>
                      <li>5. 📡 Подпишись на Telegram</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* CAMPAIGNS TAB */}
            {tab === "campaigns" && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    🚀 Активные кампании
                  </h2>
                  <p className="text-gray-400 text-sm">Промо-кампании для продвижения AliTerra</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CAMPAIGNS.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border border-purple-500/20 text-center">
                  <h3 className="text-white font-bold text-lg mb-2">🎯 Хотите больше?</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Подпишитесь на наш Telegram канал и получайте все обновления первыми!
                  </p>
                  <a
                    href="https://t.me/AliTerra_meta/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                      bg-gradient-to-r from-purple-600 to-cyan-600 text-white
                      hover:from-purple-500 hover:to-cyan-500 transition-all duration-200
                      hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                  >
                    📡 Подписаться на Telegram
                  </a>
                </div>
              </div>
            )}

            {/* PROMO TAB */}
            {tab === "promo" && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    📣 Авто-промо система
                  </h2>
                  <p className="text-gray-400 text-sm">Готовые промо-сообщения для продвижения</p>
                </div>

                {/* Auto mode status */}
                <div className={`p-4 rounded-2xl border mb-5 flex items-center gap-3
                  ${isAutoMode
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-gray-900/20 border-gray-500/30"
                  }`}>
                  <div className={`w-3 h-3 rounded-full ${isAutoMode ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">
                      Автономный режим — {isAutoMode ? "АКТИВЕН" : "ВЫКЛЮЧЕН"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {isAutoMode
                        ? "ИИ автоматически задаёт промо-вопросы каждые 12 сек"
                        : "Включите для автоматического продвижения"}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAutoMode(!isAutoMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${isAutoMode
                        ? "bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30"
                        : "bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30"
                      }`}
                  >
                    {isAutoMode ? "Выключить" : "Включить"}
                  </button>
                </div>

                {/* Promo messages */}
                <div className="space-y-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wider px-1">Готовые промо-сообщения</p>
                  {AUTO_PROMO_MESSAGES.map((msg, i) => {
                    const plain = msg.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
                    const urlMatch = msg.match(/\(([^)]+)\)/);
                    const url = urlMatch ? urlMatch[1] : "#";
                    return (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10
                        hover:border-purple-500/30 transition-all duration-200 group">
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">{plain}</p>
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors truncate"
                          >
                            {url}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(plain).catch(() => { });
                            }}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs
                              bg-purple-600/20 border border-purple-500/30 text-purple-300
                              hover:bg-purple-600/30 hover:text-white transition-all duration-200"
                          >
                            📋 Копировать
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Social links */}
                <div className="mt-6">
                  <p className="text-gray-500 text-xs uppercase tracking-wider px-1 mb-3">
                    Поделиться в соцсетях
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: "Telegram канал", url: "https://t.me/AliTerra_meta/", icon: "📡", color: "from-blue-600 to-cyan-600" },
                      { name: "Запустить майнер", url: "https://t.me/LUX_Clicker_bot", icon: "⛏️", color: "from-yellow-600 to-orange-600" },
                      { name: "Мир AliTerra", url: "https://aliterra.space/", icon: "🌐", color: "from-purple-600 to-indigo-600" },
                      { name: "NFT маркетплейс", url: "https://nft.aliterra.space/", icon: "🖼️", color: "from-pink-600 to-purple-600" },
                      { name: "HEX биржа", url: "https://hex.aliterra.space/", icon: "📈", color: "from-orange-600 to-red-600" },
                      { name: "LuxEx обменник", url: "https://luxex.aliterra.space/", icon: "🔄", color: "from-green-600 to-emerald-600" },
                    ].map((item) => (
                      <a
                        key={item.name}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium
                          bg-gradient-to-r ${item.color} text-white
                          hover:opacity-90 transition-all duration-200 hover:scale-105
                          hover:shadow-lg shadow-black/20`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs leading-tight">{item.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-white/10 bg-black/30 backdrop-blur-sm px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span style={{ fontFamily: "'Orbitron', sans-serif" }}>AliTerra © 2024</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              ИИ онлайн
            </span>
            <a href="https://aliterra.space/" target="_blank" rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-300 transition-colors">
              aliterra.space
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
