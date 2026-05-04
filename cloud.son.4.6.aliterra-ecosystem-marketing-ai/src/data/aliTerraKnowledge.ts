export const ALITERRA_LINKS = {
  mainWorld: { label: "Войти в мир AliTerra", url: "https://aliterra.space/", icon: "🌐", desc: "Главный портал метавселенной" },
  nft: { label: "Купить NFT", url: "https://nft.aliterra.space/", icon: "🖼️", desc: "Уникальные NFT активы" },
  wallet: { label: "Кошелёк", url: "https://wallet.aliterra.space/", icon: "💼", desc: "Web кошелёк AliTerra" },
  walletBot: { label: "Кошелёк бот", url: "https://t.me/aliterra_wallet_bot", icon: "🤖", desc: "Telegram бот кошелька" },
  exchange: { label: "Обменник", url: "https://luxex.aliterra.space/", icon: "🔄", desc: "LuxEx — обмен криптовалют" },
  exchangeBot: { label: "Обменник бот", url: "https://t.me/aliterra_exchange_bot", icon: "⚡", desc: "Telegram бот обменника" },
  cryptoExchange: { label: "Криптобиржа", url: "https://hex.aliterra.space/", icon: "📈", desc: "HEX — криптовалютная биржа" },
  messenger: { label: "Крипто-мессенджер", url: "https://chat.aliterra.space/", icon: "💬", desc: "Защищённый мессенджер" },
  telegram: { label: "Telegram канал", url: "https://t.me/AliTerra_meta/", icon: "📡", desc: "Официальный Telegram канал" },
  miner: { label: "Майнер", url: "https://t.me/LUX_Clicker_bot", icon: "⛏️", desc: "LUX Clicker — майнинг бот" },
};

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
  },
  {
    id: "3",
    title: "💱 LuxEx Обменник — 0% Комиссии",
    description: "Обменивай криптовалюты с нулевой комиссией на нашем обменнике. Лучший курс гарантирован!",
    status: "active",
    platform: "Web + Telegram",
    icon: "🔄",
    cta: "Обменять валюту",
    url: "https://luxex.aliterra.space/",
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
  },
  {
    id: "5",
    title: "💬 AliChat — Крипто-мессенджер",
    description: "Общайся безопасно в нашем защищённом мессенджере. Отправляй крипту прямо в чате!",
    status: "active",
    platform: "Мессенджер",
    icon: "💬",
    cta: "Открыть чат",
    url: "https://chat.aliterra.space/",
  },
];

export const AI_KNOWLEDGE_BASE = {
  about: `AliTerra — это революционная метавселенная нового поколения, объединяющая игровой мир, DeFi экосистему, NFT маркетплейс и криптовалютную инфраструктуру. Наш слоган: "Живи, играй, зарабатывай!" Это мир безграничных возможностей, умноженных на бесконечность времени.`,
  
  ecosystem: `Экосистема AliTerra включает:
• 🌐 Метавселенная — интерактивный игровой мир
• 🖼️ NFT маркетплейс — уникальные цифровые активы  
• 💼 Web и Telegram кошелёк для хранения токенов
• 🔄 LuxEx — обменник криптовалют
• 📈 HEX — криптовалютная биржа
• 💬 Защищённый крипто-мессенджер
• ⛏️ LUX Clicker — Telegram майнинг бот`,

  nft: `NFT в AliTerra — это:
• Земельные участки в метавселенной
• Уникальные персонажи и аватары
• Игровые предметы и артефакты
• Возможность пассивного дохода
• Редкие коллекционные предметы
Купить NFT: https://nft.aliterra.space/`,

  earning: `Способы заработка в AliTerra:
1. ⛏️ Майнинг LUX токенов через Telegram бота
2. 🖼️ Торговля NFT на маркетплейсе
3. 📈 Трейдинг на HEX бирже
4. 💱 Арбитраж через LuxEx обменник
5. 🎮 Игровые награды в метавселенной
6. 🤝 Реферальная программа`,

  token: `LUX — нативный токен экосистемы AliTerra.
Используется для: транзакций, NFT покупок, торговли на бирже, наград за игру и майнинг.
Майнить LUX: https://t.me/LUX_Clicker_bot`,

  howToStart: `Как начать в AliTerra:
1. 🌐 Войди в мир: aliterra.space
2. 💼 Создай кошелёк: wallet.aliterra.space
3. 🖼️ Купи первый NFT: nft.aliterra.space  
4. ⛏️ Запусти майнер: t.me/LUX_Clicker_bot
5. 📡 Подпишись на канал: t.me/AliTerra_meta`,

  security: `Безопасность в AliTerra:
• Blockchain технология для всех транзакций
• Защищённый крипто-мессенджер AliChat
• Децентрализованное хранение активов
• Web3 кошелёк без хранения приватных ключей на сервере`,
};

export const AUTO_PROMO_MESSAGES = [
  "🚀 **Новая возможность!** Купи NFT землю в AliTerra и получай пассивный доход 24/7! [nft.aliterra.space](https://nft.aliterra.space/)",
  "⛏️ **Майни LUX прямо сейчас!** Telegram бот LUX Clicker позволяет майнить без оборудования. Просто нажми старт! [t.me/LUX_Clicker_bot](https://t.me/LUX_Clicker_bot)",
  "🌐 **AliTerra ждёт тебя!** Metaverse нового поколения: играй, общайся, зарабатывай. Войди сейчас! [aliterra.space](https://aliterra.space/)",
  "💱 **Лучший курс обмена!** LuxEx предлагает нулевую комиссию на обмен криптовалют. Попробуй! [luxex.aliterra.space](https://luxex.aliterra.space/)",
  "📈 **Торгуй на HEX бирже!** Полноценная крипто-биржа внутри экосистемы AliTerra. [hex.aliterra.space](https://hex.aliterra.space/)",
  "💬 **AliChat — будущее общения!** Отправляй сообщения и крипту в одном месте. [chat.aliterra.space](https://chat.aliterra.space/)",
  "🎮 **AliTerra Metaverse** — живи, играй, зарабатывай в мире безграничных возможностей! Присоединяйся к нашему Telegram! [t.me/AliTerra_meta](https://t.me/AliTerra_meta/)",
];

export function generateAIResponse(userMessage: string): { text: string; suggestedLinks: string[] } {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("nft") || msg.includes("нфт") || msg.includes("купить") || msg.includes("покупка")) {
    return {
      text: `🖼️ **NFT в AliTerra** — это ваши цифровые активы в метавселенной!\n\n${AI_KNOWLEDGE_BASE.nft}\n\nГотов помочь вам выбрать первый NFT? Переходите на маркетплейс прямо сейчас!`,
      suggestedLinks: ["nft", "wallet", "mainWorld"],
    };
  }
  
  if (msg.includes("майн") || msg.includes("lux") || msg.includes("клик") || msg.includes("miner")) {
    return {
      text: `⛏️ **LUX Clicker — майнинг без оборудования!**\n\nЗапустите Telegram бота и начните майнить LUX токены прямо сейчас. Это бесплатно, просто и выгодно!\n\nLUX — нативный токен экосистемы AliTerra, используется во всей экосистеме: для покупки NFT, торговли на бирже и транзакций в метавселенной.`,
      suggestedLinks: ["miner", "wallet", "cryptoExchange"],
    };
  }
  
  if (msg.includes("обмен") || msg.includes("luxex") || msg.includes("exchange")) {
    return {
      text: `🔄 **LuxEx Обменник** — лучшие курсы для вас!\n\nОбменивайте криптовалюты с минимальной комиссией. Доступен как веб-версия, так и удобный Telegram бот.\n\n✅ Быстрые транзакции\n✅ Прозрачные курсы\n✅ Безопасность гарантирована`,
      suggestedLinks: ["exchange", "exchangeBot", "wallet"],
    };
  }
  
  if (msg.includes("биржа") || msg.includes("hex") || msg.includes("торговл") || msg.includes("трейд")) {
    return {
      text: `📈 **HEX — Криптобиржа AliTerra!**\n\nПолноценная торговая платформа внутри экосистемы:\n• Торговля токенами\n• Стаканы заявок в реальном времени\n• Безопасные транзакции через блокчейн\n• Встроенный в экосистему AliTerra`,
      suggestedLinks: ["cryptoExchange", "wallet", "exchange"],
    };
  }
  
  if (msg.includes("кошел") || msg.includes("wallet") || msg.includes("хранен")) {
    return {
      text: `💼 **Кошелёк AliTerra** — храните активы безопасно!\n\nДоступен в двух форматах:\n• 🌐 Веб-версия на wallet.aliterra.space\n• 🤖 Telegram бот @aliterra_wallet_bot\n\nХраните LUX токены, NFT и другие активы экосистемы в вашем персональном кошельке.`,
      suggestedLinks: ["wallet", "walletBot", "miner"],
    };
  }
  
  if (msg.includes("чат") || msg.includes("мессенджер") || msg.includes("chat") || msg.includes("общение")) {
    return {
      text: `💬 **AliChat — Крипто-мессенджер будущего!**\n\nОбщайтесь безопасно и отправляйте криптовалюту прямо в переписке:\n• 🔐 Шифрование end-to-end\n• 💸 Встроенные крипто-переводы\n• 🌐 Web3 интеграция\n• ⚡ Мгновенные транзакции`,
      suggestedLinks: ["messenger", "wallet", "telegram"],
    };
  }
  
  if (msg.includes("как начать") || msg.includes("с чего начать") || msg.includes("новичок") || msg.includes("старт") || msg.includes("начало")) {
    return {
      text: `🚀 **Добро пожаловать в AliTerra! Вот ваш путь к успеху:**\n\n${AI_KNOWLEDGE_BASE.howToStart}\n\nГотовы начать? Я помогу на каждом шагу! С чего начнём?`,
      suggestedLinks: ["mainWorld", "wallet", "miner", "nft"],
    };
  }
  
  if (msg.includes("зарабатывать") || msg.includes("доход") || msg.includes("заработок") || msg.includes("деньги") || msg.includes("прибыль")) {
    return {
      text: `💰 **Способы заработка в AliTerra:**\n\n${AI_KNOWLEDGE_BASE.earning}\n\nНачните прямо сейчас — первый шаг это запустить майнер или купить NFT!`,
      suggestedLinks: ["miner", "nft", "cryptoExchange", "exchange"],
    };
  }
  
  if (msg.includes("что такое") || msg.includes("расскажи") || msg.includes("aliterra") || msg.includes("метавселен") || msg.includes("мир")) {
    return {
      text: `🌐 **AliTerra — Метавселенная нового поколения!**\n\n${AI_KNOWLEDGE_BASE.about}\n\n${AI_KNOWLEDGE_BASE.ecosystem}\n\nХотите узнать подробнее о каком-то конкретном элементе экосистемы?`,
      suggestedLinks: ["mainWorld", "nft", "miner", "telegram"],
    };
  }
  
  if (msg.includes("telegram") || msg.includes("телеграм") || msg.includes("подписат") || msg.includes("канал")) {
    return {
      text: `📡 **Подпишитесь на официальный Telegram канал AliTerra!**\n\nПолучайте:\n• 🔔 Эксклюзивные новости и анонсы\n• 🎁 Специальные предложения для подписчиков\n• 📊 Актуальные курсы и аналитику\n• 🚀 Первыми узнавайте о новых функциях\n\nПодпишитесь прямо сейчас!`,
      suggestedLinks: ["telegram", "miner", "walletBot"],
    };
  }
  
  if (msg.includes("безопасн") || msg.includes("secure") || msg.includes("защит") || msg.includes("блокчейн")) {
    return {
      text: `🔐 **Безопасность — наш приоритет!**\n\n${AI_KNOWLEDGE_BASE.security}\n\nВаши активы надёжно защищены в экосистеме AliTerra. Доверьте нам ваши цифровые активы!`,
      suggestedLinks: ["wallet", "messenger", "mainWorld"],
    };
  }

  if (msg.includes("привет") || msg.includes("hello") || msg.includes("hi") || msg.includes("здравствуй")) {
    return {
      text: `👋 **Привет! Я AliBot — ваш персональный помощник в метавселенной AliTerra!**\n\nЯ здесь, чтобы помочь вам:\n🌐 Познакомиться с метавселенной\n💰 Начать зарабатывать\n🖼️ Найти лучшие NFT\n⛏️ Запустить майнинг\n📈 Торговать на бирже\n\nЧем могу помочь сегодня?`,
      suggestedLinks: ["mainWorld", "miner", "nft"],
    };
  }

  // Default response
  return {
    text: `🤖 Я **AliBot** — ваш проводник в метавселенной AliTerra!\n\n${AI_KNOWLEDGE_BASE.about}\n\nСпросите меня о:\n• 🖼️ NFT и цифровых активах\n• ⛏️ Майнинге LUX токенов\n• 💱 Обмене криптовалют\n• 📈 Торговле на HEX бирже\n• 💼 Кошельке AliTerra\n• 💬 Крипто-мессенджере\n• 🚀 Как начать зарабатывать\n\nЯ помогу вам освоиться в мире AliTerra!`,
    suggestedLinks: ["mainWorld", "nft", "miner", "telegram"],
  };
}
