export const ALITERRA_LINKS = {
  mainWorld:    { label: "Войти в AliTerra",    url: "https://aliterra.space/",              icon: "🌐", desc: "Главный портал метавселенной" },
  nft:          { label: "Купить NFT",           url: "https://nft.aliterra.space/",          icon: "🖼️", desc: "Уникальные NFT активы" },
  wallet:       { label: "Кошелёк",              url: "https://wallet.aliterra.space/",       icon: "💼", desc: "Web кошелёк AliTerra" },
  walletBot:    { label: "Кошелёк бот",          url: "https://t.me/aliterra_wallet_bot",     icon: "🤖", desc: "Telegram бот кошелька" },
  exchange:     { label: "LuxEx Обменник",       url: "https://luxex.aliterra.space/",        icon: "🔄", desc: "Обмен криптовалют 0% комиссия" },
  exchangeBot:  { label: "Обменник бот",         url: "https://t.me/aliterra_exchange_bot",   icon: "⚡", desc: "Telegram бот обменника" },
  cryptoExchange:{ label: "HEX Биржа",          url: "https://hex.aliterra.space/",          icon: "📈", desc: "Криптовалютная биржа" },
  messenger:    { label: "AliChat",              url: "https://chat.aliterra.space/",         icon: "💬", desc: "Защищённый крипто-мессенджер" },
  telegram:     { label: "Telegram канал",       url: "https://t.me/AliTerra_meta/",          icon: "📡", desc: "Официальный Telegram канал" },
  miner:        { label: "LUX Clicker",          url: "https://t.me/LUX_Clicker_bot",         icon: "⛏️", desc: "Telegram майнинг бот" },
};

export type LinkKey = keyof typeof ALITERRA_LINKS;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  links?: string[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  status: "active" | "scheduled" | "completed";
  platform: string;
  icon: string;
  cta: string;
  url: string;
  stats?: { label: string; value: string }[];
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    title: "🚀 NFT Запуск — Ранний доступ",
    description: "Эксклюзивные NFT земли и персонажи в AliTerra. Первые покупатели получают бонус x2 к доходу!",
    status: "active",
    platform: "NFT Маркетплейс",
    icon: "🖼️",
    cta: "Купить NFT сейчас",
    url: "https://nft.aliterra.space/",
    stats: [{ label: "Охват", value: "12 400" }, { label: "Клики", value: "3 210" }, { label: "CTR", value: "25.9%" }],
  },
  {
    id: "2",
    title: "⛏️ Майнинг кампания — LUX Clicker",
    description: "Начни майнить LUX токены прямо в Telegram. Без оборудования, без вложений — просто кликай!",
    status: "active",
    platform: "Telegram Bot",
    icon: "⛏️",
    cta: "Запустить майнер",
    url: "https://t.me/LUX_Clicker_bot",
    stats: [{ label: "Участники", value: "8 700" }, { label: "Кликов/день", value: "46 000" }, { label: "LUX выдано", value: "120K" }],
  },
  {
    id: "3",
    title: "💱 LuxEx — 0% Комиссии",
    description: "Обменивай криптовалюты с нулевой комиссией на нашем обменнике. Лучший курс гарантирован!",
    status: "active",
    platform: "Web + Telegram",
    icon: "🔄",
    cta: "Обменять валюту",
    url: "https://luxex.aliterra.space/",
    stats: [{ label: "Объём 24h", value: "$540K" }, { label: "Сделок", value: "2 100" }, { label: "Рейтинг", value: "4.9 ⭐" }],
  },
  {
    id: "4",
    title: "📈 HEX Биржа — Торгуй токенами",
    description: "Полноценная криптобиржа внутри экосистемы AliTerra. Торгуй LUX и другими токенами.",
    status: "scheduled",
    platform: "Крипто-биржа",
    icon: "📊",
    cta: "Начать торговлю",
    url: "https://hex.aliterra.space/",
    stats: [{ label: "Пар", value: "28" }, { label: "Ликвидность", value: "$1.2M" }, { label: "24h Volume", value: "$320K" }],
  },
  {
    id: "5",
    title: "💬 AliChat — Крипто-мессенджер",
    description: "Общайся безопасно и отправляй крипту прямо в чате. Будущее коммуникаций уже здесь!",
    status: "active",
    platform: "Мессенджер",
    icon: "💬",
    cta: "Открыть чат",
    url: "https://chat.aliterra.space/",
    stats: [{ label: "Пользователей", value: "5 200" }, { label: "Сообщений/день", value: "38 000" }, { label: "Транзакций", value: "1 400" }],
  },
];

export const ECOSYSTEM_CARDS = [
  { key: "mainWorld",     gradient: "from-purple-600 to-indigo-700",   glowColor: "purple" },
  { key: "nft",          gradient: "from-pink-600 to-rose-700",        glowColor: "pink"   },
  { key: "miner",        gradient: "from-yellow-500 to-orange-600",    glowColor: "yellow" },
  { key: "exchange",     gradient: "from-green-600 to-emerald-700",    glowColor: "green"  },
  { key: "cryptoExchange",gradient: "from-orange-500 to-red-600",      glowColor: "orange" },
  { key: "messenger",    gradient: "from-cyan-600 to-blue-700",        glowColor: "cyan"   },
  { key: "wallet",       gradient: "from-violet-600 to-purple-700",    glowColor: "violet" },
  { key: "telegram",     gradient: "from-blue-500 to-cyan-600",        glowColor: "blue"   },
];

export const QUICK_QUESTIONS = [
  "Что такое AliTerra?",
  "Как заработать LUX?",
  "Как купить NFT?",
  "Что такое LuxEx?",
  "Как начать майнить?",
  "Расскажи о HEX бирже",
  "Что такое AliChat?",
  "Как создать кошелёк?",
];

export const AUTO_PROMO_MESSAGES = [
  "🚀 **Новая возможность!** Купи NFT землю в AliTerra и получай пассивный доход 24/7! [nft.aliterra.space](https://nft.aliterra.space/)",
  "⛏️ **Майни LUX прямо сейчас!** Telegram бот LUX Clicker позволяет майнить без оборудования. Просто нажми старт! [t.me/LUX_Clicker_bot](https://t.me/LUX_Clicker_bot)",
  "🌐 **AliTerra ждёт тебя!** Metaverse нового поколения: играй, общайся, зарабатывай. Войди сейчас! [aliterra.space](https://aliterra.space/)",
  "💱 **Лучший курс обмена!** LuxEx предлагает нулевую комиссию на обмен криптовалют. Попробуй! [luxex.aliterra.space](https://luxex.aliterra.space/)",
  "📈 **Торгуй на HEX бирже!** Полноценная крипто-биржа внутри экосистемы AliTerra. [hex.aliterra.space](https://hex.aliterra.space/)",
  "💬 **AliChat — будущее общения!** Отправляй сообщения и крипту в одном месте. [chat.aliterra.space](https://chat.aliterra.space/)",
  "🎮 **AliTerra Metaverse** — живи, играй, зарабатывай в мире безграничных возможностей! [t.me/AliTerra_meta](https://t.me/AliTerra_meta/)",
  "💼 **Твой криптокошелёк** ждёт! Управляй активами через Web или Telegram бот. [wallet.aliterra.space](https://wallet.aliterra.space/)",
  "🖼️ **NFT коллекция AliTerra** пополнилась! Редкие персонажи и земли уже доступны на маркетплейсе. [nft.aliterra.space](https://nft.aliterra.space/)",
  "⚡ **LUX токен растёт!** Начни накапливать LUX уже сегодня через майнинг и торговлю на HEX бирже. [hex.aliterra.space](https://hex.aliterra.space/)",
];

const AI_KNOWLEDGE_BASE = {
  about: `AliTerra — это революционная метавселенная нового поколения, объединяющая игровой мир, DeFi экосистему, NFT маркетплейс и криптовалютную инфраструктуру. Слоган: "Живи, играй, зарабатывай!" Это мир безграничных возможностей, умноженных на бесконечность времени.`,
  ecosystem: `Экосистема AliTerra включает:\n• 🌐 Метавселенная — интерактивный игровой мир\n• 🖼️ NFT маркетплейс — уникальные цифровые активы\n• 💼 Web и Telegram кошелёк\n• 🔄 LuxEx — обменник криптовалют (0% комиссия)\n• 📈 HEX — криптовалютная биржа\n• 💬 AliChat — защищённый крипто-мессенджер\n• ⛏️ LUX Clicker — Telegram майнинг бот`,
  nft: `NFT в AliTerra:\n• Земельные участки в метавселенной\n• Уникальные персонажи и аватары\n• Игровые предметы и артефакты\n• Пассивный доход от NFT активов\n• Редкие коллекционные предметы\nМаркетплейс: https://nft.aliterra.space/`,
  earning: `Способы заработка в AliTerra:\n1. ⛏️ Майнинг LUX через Telegram бота (бесплатно)\n2. 🖼️ Торговля NFT на маркетплейсе\n3. 📈 Трейдинг на HEX бирже\n4. 💱 Арбитраж через LuxEx обменник\n5. 🎮 Игровые награды в метавселенной\n6. 🤝 Реферальная программа`,
  token: `LUX — нативный токен экосистемы AliTerra.\nПрименение: транзакции, NFT покупки, торговля, награды.\nМайнить: https://t.me/LUX_Clicker_bot`,
  howToStart: `Как начать в AliTerra:\n1. 🌐 Войди: aliterra.space\n2. 💼 Кошелёк: wallet.aliterra.space\n3. 🖼️ Первый NFT: nft.aliterra.space\n4. ⛏️ Майнер: t.me/LUX_Clicker_bot\n5. 📡 Telegram: t.me/AliTerra_meta`,
  security: `Безопасность AliTerra:\n• Blockchain для всех транзакций\n• Защищённый мессенджер AliChat\n• Децентрализованное хранение\n• Web3 кошелёк (приватные ключи у вас)`,
  wallet: `Кошелёк AliTerra:\n• Web версия: wallet.aliterra.space\n• Telegram бот: @aliterra_wallet_bot\n• Хранение LUX и других токенов\n• Отправка и получение криптовалюты\n• Безопасный доступ 24/7`,
  exchange: `LuxEx Обменник:\n• 0% комиссия на обмен\n• Лучшие рыночные курсы\n• Web: luxex.aliterra.space\n• Telegram бот: @aliterra_exchange_bot\n• Быстрые транзакции`,
  hex: `HEX — Криптобиржа AliTerra:\n• Полноценная торговая платформа\n• 28+ торговых пар\n• Стаканы заявок в реальном времени\n• Интегрирована в экосистему\n• Сайт: hex.aliterra.space`,
  chat: `AliChat — Крипто-мессенджер:\n• Защищённые сообщения\n• Отправка крипты прямо в чате\n• End-to-end шифрование\n• Групповые чаты\n• chat.aliterra.space`,
};

export function generateAIResponse(userMessage: string): { text: string; suggestedLinks: string[] } {
  const msg = userMessage.toLowerCase();

  if (msg.includes("что такое") && msg.includes("aliterra") || msg.includes("расскажи") && msg.includes("aliterra") || msg.includes("о проекте") || msg.includes("метавселен")) {
    return {
      text: `🌐 **AliTerra — Метавселенная нового поколения!**\n\n${AI_KNOWLEDGE_BASE.about}\n\n${AI_KNOWLEDGE_BASE.ecosystem}\n\nГотов погрузиться в мир будущего? Начни прямо сейчас!`,
      suggestedLinks: ["mainWorld", "telegram", "miner"],
    };
  }

  if (msg.includes("nft") || msg.includes("нфт") || msg.includes("купить нфт") || msg.includes("купи нфт")) {
    return {
      text: `🖼️ **NFT в AliTerra** — ваши цифровые активы в метавселенной!\n\n${AI_KNOWLEDGE_BASE.nft}\n\nГотов к покупке первого NFT? Переходи на маркетплейс!`,
      suggestedLinks: ["nft", "wallet", "mainWorld"],
    };
  }

  if (msg.includes("майн") || msg.includes("lux clicker") || msg.includes("кликер") || msg.includes("мин") && msg.includes("lux")) {
    return {
      text: `⛏️ **LUX Clicker — майнинг без оборудования!**\n\nЗапусти Telegram бота и начни майнить LUX токены бесплатно. Просто нажимай!\n\n${AI_KNOWLEDGE_BASE.token}\n\n✅ Без вложений\n✅ Без специального железа\n✅ 24/7 пассивный доход`,
      suggestedLinks: ["miner", "wallet", "cryptoExchange"],
    };
  }

  if (msg.includes("lux") && !msg.includes("luxex") || msg.includes("токен") || msg.includes("монет")) {
    return {
      text: `💎 **LUX Токен — сердце экосистемы AliTerra!**\n\n${AI_KNOWLEDGE_BASE.token}\n\n📊 LUX используется во всей экосистеме:\n• Покупка NFT на маркетплейсе\n• Торговля на HEX бирже\n• Транзакции в метавселенной\n• Оплата в AliChat\n\nНачни накапливать LUX уже сейчас!`,
      suggestedLinks: ["miner", "cryptoExchange", "nft"],
    };
  }

  if (msg.includes("обмен") || msg.includes("luxex") || msg.includes("люксекс")) {
    return {
      text: `🔄 **LuxEx Обменник** — лучшие курсы криптовалют!\n\n${AI_KNOWLEDGE_BASE.exchange}\n\n✅ Быстрые транзакции\n✅ Прозрачные курсы\n✅ Безопасность блокчейна\n✅ Доступен Web и Telegram`,
      suggestedLinks: ["exchange", "exchangeBot", "wallet"],
    };
  }

  if (msg.includes("биржа") || msg.includes("hex") || msg.includes("торговл") || msg.includes("трейд")) {
    return {
      text: `📈 **HEX — Криптобиржа AliTerra!**\n\n${AI_KNOWLEDGE_BASE.hex}\n\nНачни торговать прямо сейчас и зарабатывай на движении рынка!`,
      suggestedLinks: ["cryptoExchange", "wallet", "exchange"],
    };
  }

  if (msg.includes("кошел") || msg.includes("wallet") || msg.includes("хранить")) {
    return {
      text: `💼 **Кошелёк AliTerra** — твой крипто-сейф!\n\n${AI_KNOWLEDGE_BASE.wallet}\n\nСоздай кошелёк бесплатно и управляй активами из любого места!`,
      suggestedLinks: ["wallet", "walletBot", "exchange"],
    };
  }

  if (msg.includes("чат") || msg.includes("мессенджер") || msg.includes("alichat") || msg.includes("алич")) {
    return {
      text: `💬 **AliChat — Крипто-мессенджер будущего!**\n\n${AI_KNOWLEDGE_BASE.chat}\n\nОбщайся безопасно и отправляй крипту прямо в переписке!`,
      suggestedLinks: ["messenger", "wallet", "telegram"],
    };
  }

  if (msg.includes("заработ") || msg.includes("доход") || msg.includes("деньг") || msg.includes("прибыл")) {
    return {
      text: `💰 **Зарабатывай с AliTerra!**\n\n${AI_KNOWLEDGE_BASE.earning}\n\nСамый простой старт — запустить LUX Clicker и начать майнить прямо сейчас, бесплатно!`,
      suggestedLinks: ["miner", "nft", "cryptoExchange"],
    };
  }

  if (msg.includes("безопас") || msg.includes("блокчейн") || msg.includes("security") || msg.includes("защит")) {
    return {
      text: `🔒 **Безопасность — наш приоритет!**\n\n${AI_KNOWLEDGE_BASE.security}\n\nВаши активы защищены технологией блокчейн на каждом уровне экосистемы.`,
      suggestedLinks: ["wallet", "messenger", "mainWorld"],
    };
  }

  if (msg.includes("начат") || msg.includes("старт") || msg.includes("как") || msg.includes("помоги") || msg.includes("первый шаг")) {
    return {
      text: `🚀 **Начни свой путь в AliTerra!**\n\n${AI_KNOWLEDGE_BASE.howToStart}\n\nЭто займёт всего 5 минут — и ты уже внутри экосистемы будущего!`,
      suggestedLinks: ["mainWorld", "miner", "wallet"],
    };
  }

  if (msg.includes("telegram") || msg.includes("телеграм") || msg.includes("канал")) {
    return {
      text: `📡 **Официальный Telegram канал AliTerra!**\n\nПодпишись на канал, чтобы:\n• 🔔 Получать последние новости\n• 💡 Узнавать о новых возможностях\n• 🎁 Участвовать в эксклюзивных розыгрышах\n• 📢 Быть в курсе обновлений экосистемы\n\nТакже доступны Telegram боты: кошелёк и обменник!`,
      suggestedLinks: ["telegram", "walletBot", "exchangeBot"],
    };
  }

  // Default response
  const responses = [
    {
      text: `🤖 **AliTerra AI Promo Assistant готов помочь!**\n\nЯ могу рассказать о:\n• 🌐 Метавселенной AliTerra\n• 🖼️ NFT маркетплейсе\n• ⛏️ Майнинге LUX токенов\n• 💱 Обменнике LuxEx\n• 📈 Бирже HEX\n• 💬 Мессенджере AliChat\n• 💼 Кошельке AliTerra\n\nЗадай любой вопрос или выбери тему из быстрых вопросов!`,
      suggestedLinks: ["mainWorld", "miner", "nft"],
    },
    {
      text: `🌟 **Добро пожаловать в AliTerra!**\n\n${AI_KNOWLEDGE_BASE.about}\n\nХочешь узнать, как начать зарабатывать в нашей экосистеме? Спроси меня!`,
      suggestedLinks: ["mainWorld", "telegram", "miner"],
    },
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
