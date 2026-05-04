import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Channel = "steam" | "reddit" | "x" | "tiktok" | "discord";
type QueueStatus = "done" | "active" | "queued";
type AutopilotMode = "draft" | "assist" | "auto";

type Campaign = {
  productName: string;
  genre: string;
  audience: string;
  objective: string;
  tone: string;
  channels: Channel[];
};

type Asset = {
  id: string;
  name: string;
  url?: string;
  source: "repo" | "upload";
};

type GeneratedPost = {
  id: string;
  channel: Channel;
  headline: string;
  body: string;
  cta: string;
  publishAt: string;
};

type QueueStep = {
  id: string;
  title: string;
  status: QueueStatus;
};

type ChannelMetric = {
  channel: Channel;
  impressions: number;
  clicks: number;
  ctr: string;
  conversions: number;
};

type LLMProvider = "responses" | "chat";

type LLMSettings = {
  provider: LLMProvider;
  endpoint: string;
  model: string;
  temperature: number;
  systemPrompt: string;
};

type LlmPreset = "openai" | "openrouter" | "groq";
type CopyStyle = "performance" | "community" | "premium";

type XPublishResult = {
  id: string;
  text: string;
  url: string;
};

type JobView = {
  id: string;
  type: string;
  status: string;
  attempts: number;
  error: string | null;
  updatedAt: string;
};

const channelLabels: Record<Channel, string> = {
  steam: "Steam",
  reddit: "Reddit",
  x: "X / Twitter",
  tiktok: "TikTok",
  discord: "Discord"
};

const modeLabels: Record<AutopilotMode, string> = {
  draft: "Draft only",
  assist: "Approval required",
  auto: "Full auto"
};

const defaultCampaign: Campaign = {
  productName: "",
  genre: "Action Roguelite",
  audience: "Игроки 18-34, любят динамичный геймплей и челлендж",
  objective: "Рост wishlist",
  tone: "Энергичный, уверенный, без кликбейта",
  channels: ["steam", "reddit", "x"]
};

const defaultLLMSettings: LLMSettings = {
  provider: "responses",
  endpoint: "https://api.openai.com/v1/responses",
  model: "gpt-4.1-mini",
  temperature: 0.7,
  systemPrompt:
    "Ты senior growth marketer для indie game. Пиши только конкретные продающие тексты: выгода, контекст, CTA, без воды и абстракций. Возвращай только валидный JSON."
};

const copyStyleLabels: Record<CopyStyle, string> = {
  performance: "Агрессивный перформанс",
  community: "Комьюнити-friendly",
  premium: "Премиальный/брендовый"
};

const llmPresets: Record<LlmPreset, Omit<LLMSettings, "systemPrompt" | "temperature">> = {
  openai: {
    provider: "responses",
    endpoint: "https://api.openai.com/v1/responses",
    model: "gpt-4.1-mini"
  },
  openrouter: {
    provider: "chat",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "openai/gpt-4o-mini"
  },
  groq: {
    provider: "chat",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant"
  }
};

const repoMaterialModules = import.meta.glob("../materials/**/*.{png,jpg,jpeg,webp,gif}");

function toTitle(filename: string) {
  return filename
    .replace(/\.[a-zA-Z]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makePublishTime(index: number) {
  const date = new Date();
  date.setDate(date.getDate() + index);
  date.setHours(12 + (index % 3) * 3, 0, 0, 0);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function normalizeObjective(rawObjective: string) {
  const value = rawObjective.trim();
  if (!value) {
    return "рост wishlist и целевых переходов";
  }
  if (/пользовател/i.test(value)) {
    return "рост целевых подписок и wishlist";
  }
  return value;
}

function makePosts(campaign: Campaign, assets: Asset[]): GeneratedPost[] {
  const product = campaign.productName.trim() || "AliTerra";
  const objective = normalizeObjective(campaign.objective);
  const genre = campaign.genre.trim();
  const audience = campaign.audience.trim();
  const visualLead = assets.length > 0 ? `На первом кадре: ${assets[0].name}.` : "Покажи самый сильный скриншот с ключевой механикой.";

  return campaign.channels.map((channel, index) => {
    const base = {
      steam: {
        headline: `${product}: новый апдейт с упором на ${objective}`,
        body: `${product} в жанре ${genre} получил обновление: темп выше, прогрессия понятнее, бой читается с первых секунд. ${visualLead}`,
        cta: "Добавить в wishlist"
      },
      reddit: {
        headline: `Ищем честный фидбек по ${product} перед следующим билдом`,
        body: `Делаем ${genre} для аудитории ${audience}. Что сильнее цепляет лично тебя: скорость боя, глубина билда или ощущение прогрессии? ${visualLead}`,
        cta: "Написать мнение в комментариях"
      },
      x: {
        headline: `${product}: один кадр, который продает идею игры`,
        body: `Самый сильный момент текущего билда: динамика боя, мгновенный отклик и чистый визуальный фокус. Цель поста: ${objective}. ${visualLead}`,
        cta: "Открыть страницу игры"
      },
      tiktok: {
        headline: `${product}: 15 секунд, после которых хочется попробовать`,
        body: `Сценарий: мгновенный хук на первых кадрах, затем самая вкусная механика и финальный payoff. Текст и ритм под аудиторию ${audience}.`,
        cta: "Ссылка в профиле"
      },
      discord: {
        headline: `${product}: weekly update и планы на следующую итерацию`,
        body: `Что уже улучшили в билде, что тестируем сейчас и где особенно нужен фидбек сообщества. ${visualLead}`,
        cta: "Войти на сервер"
      }
    }[channel];

    return {
      id: `${channel}-${index}`,
      channel,
      headline: base.headline,
      body: base.body,
      cta: base.cta,
      publishAt: makePublishTime(index + 1)
    };
  });
}

function makeQueue(posts: GeneratedPost[], activeIndex: number | null) {
  const steps = [
    "Сбор новых материалов и ключевых тезисов",
    `Генерация ${posts.length} черновиков под каналы`,
    "Проверка риск-постов и финальное подтверждение",
    "Автопубликация по календарю",
    "Сбор KPI и автооптимизация промптов"
  ];

  return steps.map((title, index) => {
    const status: QueueStatus =
      activeIndex === null || index < activeIndex ? "done" : index === activeIndex ? "active" : "queued";
    return { id: `step-${index}`, title, status };
  });
}

function makeMetrics(posts: GeneratedPost[]): ChannelMetric[] {
  return posts.map((post, index) => {
    const impressions = 1200 + index * 520;
    const clicks = Math.round(impressions * (0.065 + index * 0.007));
    const conversions = Math.round(clicks * (0.16 + index * 0.02));
    const ctr = `${((clicks / impressions) * 100).toFixed(1)}%`;

    return {
      channel: post.channel,
      impressions,
      clicks,
      ctr,
      conversions
    };
  });
}

function stamp(message: string) {
  const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `[${time}] ${message}`;
}

function buildTweetText(post: GeneratedPost) {
  const merged = `${post.headline}\n\n${post.body}\n\n${post.cta}`.replace(/\s+/g, " ").trim();
  if (merged.length <= 280) {
    return merged;
  }
  return `${merged.slice(0, 277)}...`;
}

export default function App() {
  const [campaign, setCampaign] = useState<Campaign>(defaultCampaign);
  const [selectedRepoAssetIds, setSelectedRepoAssetIds] = useState<string[]>([]);
  const [repoAssetUrls, setRepoAssetUrls] = useState<Record<string, string>>({});
  const [uploadedAssets, setUploadedAssets] = useState<Asset[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [queue, setQueue] = useState<QueueStep[]>([]);
  const [metrics, setMetrics] = useState<ChannelMetric[]>([]);
  const [autopilotMode, setAutopilotMode] = useState<AutopilotMode>("assist");
  const [llmSettings, setLlmSettings] = useState<LLMSettings>(defaultLLMSettings);
  const [llmPreset, setLlmPreset] = useState<LlmPreset>("openai");
  const [copyStyle, setCopyStyle] = useState<CopyStyle>("performance");
  const [smartAssist, setSmartAssist] = useState(true);
  const [isLlmGenerating, setIsLlmGenerating] = useState(false);
  const [llmError, setLlmError] = useState("");
  const [isPublishingToX, setIsPublishingToX] = useState(false);
  const [xPublishError, setXPublishError] = useState("");
  const [xPublishResults, setXPublishResults] = useState<XPublishResult[]>([]);
  const [activeJob, setActiveJob] = useState<JobView | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const uploadedAssetsRef = useRef<Asset[]>([]);
  const timersRef = useRef<number[]>([]);

  const repoAssets = useMemo<Asset[]>(() => {
    return Object.entries(repoMaterialModules)
      .map(([filePath]) => {
        const fileName = filePath.split("/").pop() ?? filePath;
        return { id: filePath, name: toTitle(fileName), source: "repo" as const };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const hydratedRepoAssets = useMemo(() => {
    return repoAssets.map((asset) => ({ ...asset, url: repoAssetUrls[asset.id] }));
  }, [repoAssets, repoAssetUrls]);

  const selectedRepoAssets = useMemo(() => {
    return hydratedRepoAssets.filter((asset) => selectedRepoAssetIds.includes(asset.id));
  }, [hydratedRepoAssets, selectedRepoAssetIds]);

  const allSelectedAssets = [...selectedRepoAssets, ...uploadedAssets];
  const heroImage =
    allSelectedAssets.find((asset) => typeof asset.url === "string")?.url ??
    hydratedRepoAssets.find((asset) => typeof asset.url === "string")?.url;

  const queuePayloadText = useMemo(() => {
    if (posts.length === 0) {
      return "";
    }

    const payload = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      autopilotMode,
      campaign,
      assets: allSelectedAssets.map((asset) => ({ name: asset.name, source: asset.source })),
      posts,
      queue,
      metrics,
      integrationHint: {
        endpoint: "https://your-autopost-worker.example/publish",
        method: "POST",
        notes: "Передай payload целиком в свой worker и маппинг каналов."
      }
    };

    return JSON.stringify(payload, null, 2);
  }, [allSelectedAssets, autopilotMode, campaign, metrics, posts, queue]);

  const hasProductName = campaign.productName.trim().length > 1;
  const hasChannels = campaign.channels.length > 0;
  const hasAnyAssets = allSelectedAssets.length > 0 || hydratedRepoAssets.length > 0;
  const hasPlan = posts.length > 0;
  const setupProgress = [hasProductName, hasChannels, hasAnyAssets, hasPlan].filter(Boolean).length;
  const setupPercent = Math.round((setupProgress / 4) * 100);

  function clearTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function appendLog(message: string) {
    setActivityLog((prev) => [stamp(message), ...prev].slice(0, 12));
  }

  function moveToStep(stepIndex: number | null, nextPosts: GeneratedPost[]) {
    setQueue(makeQueue(nextPosts, stepIndex));
  }

  function finishPipeline(nextPosts: GeneratedPost[]) {
    moveToStep(null, nextPosts);
    setMetrics(makeMetrics(nextPosts));
    setAwaitingApproval(false);
    setIsRunning(false);
    appendLog("Цикл завершен: метрики собраны, промпты обновлены.");
  }

  function continueAfterApproval(nextPosts: GeneratedPost[]) {
    setAwaitingApproval(false);
    setIsRunning(true);
    appendLog("Публикация подтверждена, продолжаем автономный цикл.");
    moveToStep(3, nextPosts);

    const publishTimer = window.setTimeout(() => {
      appendLog("Посты отправлены в запланированные каналы.");
      moveToStep(4, nextPosts);
    }, 1300);

    const analyzeTimer = window.setTimeout(() => {
      finishPipeline(nextPosts);
    }, 2600);

    timersRef.current.push(publishTimer, analyzeTimer);
  }

  function runPipeline(nextPosts: GeneratedPost[], mode: AutopilotMode) {
    clearTimers();
    setMetrics([]);
    setAwaitingApproval(false);
    setIsRunning(true);

    appendLog(`Автопилот запущен в режиме ${modeLabels[mode]}.`);
    moveToStep(0, nextPosts);

    const ingestTimer = window.setTimeout(() => {
      appendLog("Материалы нормализованы, выделены ключевые тезисы.");
      moveToStep(1, nextPosts);
    }, 900);

    const draftTimer = window.setTimeout(() => {
      appendLog(`Сгенерированы ${nextPosts.length} постов под выбранные каналы.`);
      moveToStep(2, nextPosts);

      if (mode === "draft") {
        setIsRunning(false);
        appendLog("Режим Draft only: помощник остановлен перед публикацией.");
        return;
      }

      if (mode === "assist") {
        setIsRunning(false);
        setAwaitingApproval(true);
        appendLog("Ожидается ручное подтверждение публикации.");
        return;
      }

      continueAfterApproval(nextPosts);
    }, 1900);

    timersRef.current.push(ingestTimer, draftTimer);
  }

  function generateCampaignPlan() {
    if (campaign.channels.length === 0) {
      return;
    }

    clearTimers();
    setAwaitingApproval(false);
    setIsRunning(false);

    const nextPosts = makePosts(campaign, allSelectedAssets);
    setPosts(nextPosts);
    setQueue(makeQueue(nextPosts, 2));
    setMetrics([]);
    appendLog(`План создан: ${nextPosts.length} каналов готовы к запуску.`);
  }

  function runCurrentPlan() {
    if (posts.length === 0) {
      return;
    }
    runPipeline(posts, autopilotMode);
  }

  function quickStartAssistant() {
    if (!hasChannels) {
      setXPublishError("Выбери хотя бы один канал в шаге 1.");
      return;
    }

    const plan = posts.length > 0 ? posts : makePosts(campaign, allSelectedAssets);
    if (posts.length === 0) {
      setPosts(plan);
      setQueue(makeQueue(plan, 2));
      appendLog(`Быстрый старт создал план: ${plan.length} постов.`);
    }

    runPipeline(plan, autopilotMode);
  }

  function runLocalGeneration(message?: string) {
    const fallbackPosts = makePosts(campaign, allSelectedAssets);
    clearTimers();
    setPosts(fallbackPosts);
    setQueue(makeQueue(fallbackPosts, 2));
    setMetrics([]);
    setAwaitingApproval(false);
    setIsRunning(false);
    setBackendUnavailable(true);
    if (message) {
      setLlmError(message);
      appendLog(message);
    }
  }

  function applyLlmPreset(preset: LlmPreset) {
    const config = llmPresets[preset];
    setLlmPreset(preset);
    setLlmSettings((prev) => ({
      ...prev,
      provider: config.provider,
      endpoint: config.endpoint,
      model: config.model
    }));
    appendLog(`Применен LLM пресет: ${preset}.`);
  }

  async function generateWithLLM() {
    if (campaign.channels.length === 0) {
      setLlmError("Выбери хотя бы один канал.");
      return;
    }

    setLlmError("");
    setIsLlmGenerating(true);

    if (backendUnavailable) {
      runLocalGeneration("Серверный режим недоступен. Автоматически включен локальный режим генерации.");
      setIsLlmGenerating(false);
      return;
    }

    try {
      const idempotencyKey = `llm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          campaign,
          channels: campaign.channels,
          assets: allSelectedAssets.map((asset) => ({ name: asset.name, source: asset.source })),
          llmSettings,
          copyStyle,
          smartAssist
        })
      });

      const payload = (await parseApiJson(response)) as {
        ok?: boolean;
        error?: string;
        jobId?: string;
        posts?: GeneratedPost[];
      };

      if (payload.jobId) {
        void refreshJobStatus(payload.jobId);
      }

      if (!response.ok || !payload.ok || !payload.posts) {
        throw new Error(payload.error || `HTTP ${response.status}`);
      }

      setBackendUnavailable(false);

      const nextPosts = payload.posts;

      clearTimers();
      setPosts(nextPosts);
      setQueue(makeQueue(nextPosts, 2));
      setMetrics([]);
      setAwaitingApproval(false);
      setIsRunning(false);
      appendLog(`LLM proxy сгенерировал ${nextPosts.length} постов.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка LLM запроса";
      if (message.includes("Not found: /api/generate-posts")) {
        runLocalGeneration("Серверный режим недоступен. Использован локальный генератор продающих постов.");
      } else {
        setLlmError(message);
        appendLog(`Ошибка LLM: ${message}`);
      }
    } finally {
      setIsLlmGenerating(false);
    }
  }

  function downloadQueueJson() {
    if (!queuePayloadText) {
      return;
    }

    const blob = new Blob([queuePayloadText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promo-queue-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    appendLog("JSON очередь экспортирована для интеграции с автопостингом.");
  }

  async function parseApiJson(response: Response) {
    const raw = await response.text();
    if (!raw) {
      return {} as Record<string, unknown>;
    }

    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      const hint = raw.slice(0, 180).replace(/\s+/g, " ");
      if (hint.toLowerCase().includes("not found: /api/")) {
        setBackendUnavailable(true);
      }
      throw new Error(
        `Сервер недоступен: ${hint}`
      );
    }
  }

  async function refreshJobStatus(jobId: string) {
    try {
      const response = await fetch(`/api/jobs/status?id=${encodeURIComponent(jobId)}`);
      const payload = (await parseApiJson(response)) as {
        ok?: boolean;
        job?: JobView;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.job) {
        throw new Error(payload.error || `HTTP ${response.status}`);
      }

      setActiveJob(payload.job);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка чтения статуса job";
      appendLog(`Не удалось обновить статус job: ${message}`);
      if (message.includes("Not found: /api/jobs/status")) {
        setBackendUnavailable(true);
      }
    }
  }

  async function publishQueuedPosts() {
    const publishablePosts = posts.filter(
      (post) => post.channel === "x" || post.channel === "discord" || post.channel === "reddit"
    );

    if (publishablePosts.length === 0) {
      setXPublishError("Нет постов для X/Discord/Reddit. Добавь эти каналы и сгенерируй план.");
      return;
    }

    setXPublishError("");
    setIsPublishingToX(true);

    try {
      const idempotencyKey = `publish-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          autoplan: true,
          posts: publishablePosts.map((post) => {
            if (post.channel === "reddit") {
              return {
                channel: "reddit",
                title: post.headline,
                body: `${post.body}\n\n${post.cta}`,
                text: `${post.headline} ${post.body} ${post.cta}`,
                sourcePostId: post.id
              };
            }

            if (post.channel === "discord") {
              return {
                channel: "discord",
                text: `${post.headline}\n${post.body}\n${post.cta}`,
                sourcePostId: post.id
              };
            }

            return {
              channel: "x",
              text: buildTweetText(post),
              sourcePostId: post.id
            };
          })
        })
      });

      const payload = (await parseApiJson(response)) as {
        ok?: boolean;
        error?: string;
        jobs?: Array<{ id: string; channel: string; scheduledAt: string }>;
      };

      if (Array.isArray(payload.jobs) && payload.jobs.length > 0) {
        void refreshJobStatus(String(payload.jobs[0].id));
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || `HTTP ${response.status}`);
      }

      setBackendUnavailable(false);

      setXPublishResults(
        (payload.jobs || []).map((job) => ({
          id: String(job.id),
          text: `queued for ${job.channel}`,
          url: ""
        }))
      );
      appendLog(`В persistent queue добавлено задач: ${(payload.jobs || []).length}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка постановки задач в очередь";
      setXPublishError(message);
      appendLog(`Ошибка publish router: ${message}`);
      if (message.includes("Not found: /api/publish")) {
        setBackendUnavailable(true);
      }
    } finally {
      setIsPublishingToX(false);
    }
  }

  function runDemoScenario() {
    const demoCampaign: Campaign = {
      productName: "Neon Core",
      genre: "Sci-fi Action Roguelite",
      audience: "PC игроки 18-34, любят быстрые билды и реиграбельность",
      objective: "Рост wishlist перед демо-фестивалем",
      tone: "Уверенный, быстрый, без кликбейта",
      channels: ["steam", "reddit", "x", "discord"]
    };

    const demoRepoAssetIds = repoAssets.slice(0, 3).map((asset) => asset.id);
    const demoAssets = repoAssets.filter((asset) => demoRepoAssetIds.includes(asset.id));
    const nextPosts = makePosts(demoCampaign, demoAssets);

    clearTimers();
    setCampaign(demoCampaign);
    setSelectedRepoAssetIds(demoRepoAssetIds);
    setPosts(nextPosts);
    setAutopilotMode("auto");
    setActivityLog([]);
    appendLog("Запущен демо-сценарий: Neon Core.");
    runPipeline(nextPosts, "auto");
  }

  function approvePublication() {
    if (posts.length === 0 || !awaitingApproval) {
      return;
    }
    continueAfterApproval(posts);
  }

  function updateCampaign<K extends keyof Campaign>(key: K, value: Campaign[K]) {
    setCampaign((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChannel(channel: Channel) {
    const hasChannel = campaign.channels.includes(channel);
    if (hasChannel) {
      updateCampaign(
        "channels",
        campaign.channels.filter((item) => item !== channel)
      );
      return;
    }
    updateCampaign("channels", [...campaign.channels, channel]);
  }

  function toggleRepoAsset(assetId: string) {
    setSelectedRepoAssetIds((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((id) => id !== assetId);
      }
      return [...prev, assetId];
    });
  }

  async function ensureRepoAssetUrl(assetId: string) {
    if (repoAssetUrls[assetId]) {
      return;
    }

    const loader = repoMaterialModules[assetId];
    if (!loader) {
      return;
    }

    try {
      const loaded = await loader();
      if (typeof loaded === "string") {
        setRepoAssetUrls((prev) => {
          if (prev[assetId]) {
            return prev;
          }
          return { ...prev, [assetId]: loaded };
        });
      }
    } catch {
      appendLog(`Не удалось загрузить превью для ${assetId}.`);
    }
  }

  function handleUpload(files: FileList | null) {
    if (!files) {
      return;
    }

    const newAssets: Asset[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        name: toTitle(file.name),
        url: URL.createObjectURL(file),
        source: "upload"
      }));

    setUploadedAssets((prev) => [...prev, ...newAssets]);
  }

  useEffect(() => {
    uploadedAssetsRef.current = uploadedAssets;
  }, [uploadedAssets]);

  useEffect(() => {
    selectedRepoAssetIds.forEach((assetId) => {
      void ensureRepoAssetUrl(assetId);
    });
  }, [selectedRepoAssetIds]);

  useEffect(() => {
    const draftRaw = localStorage.getItem("promo-os-draft");
    if (!draftRaw) {
      return;
    }

    try {
      const draft = JSON.parse(draftRaw) as {
        campaign: Campaign;
        selectedRepoAssetIds: string[];
        autopilotMode: AutopilotMode;
        llmSettings: LLMSettings;
        copyStyle: CopyStyle;
        smartAssist: boolean;
      };

      if (draft.campaign) {
        setCampaign(draft.campaign);
      }
      if (draft.selectedRepoAssetIds) {
        setSelectedRepoAssetIds(draft.selectedRepoAssetIds);
      }
      if (draft.autopilotMode) {
        setAutopilotMode(draft.autopilotMode);
      }
      if (draft.llmSettings) {
        setLlmSettings((prev) => ({ ...prev, ...draft.llmSettings }));
      }
      if (draft.copyStyle) {
        setCopyStyle(draft.copyStyle);
      }
      if (typeof draft.smartAssist === "boolean") {
        setSmartAssist(draft.smartAssist);
      }
    } catch {
      // Ignore corrupted drafts and continue with defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "promo-os-draft",
      JSON.stringify({
        campaign,
        selectedRepoAssetIds,
        autopilotMode,
        llmSettings: {
          provider: llmSettings.provider,
          endpoint: llmSettings.endpoint,
          model: llmSettings.model,
          temperature: llmSettings.temperature,
          systemPrompt: llmSettings.systemPrompt
        },
        copyStyle,
        smartAssist
      })
    );
  }, [campaign, selectedRepoAssetIds, autopilotMode, llmSettings, copyStyle, smartAssist]);

  useEffect(() => {
    return () => {
      clearTimers();
      uploadedAssetsRef.current.forEach((asset) => {
        if (asset.source === "upload" && asset.url) {
          URL.revokeObjectURL(asset.url);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative min-h-[86vh] overflow-hidden border-b border-slate-800">
        {heroImage ? (
          <img src={heroImage} alt="Game visual" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        ) : null}
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto flex min-h-[86vh] w-full max-w-6xl flex-col justify-center px-6 py-20"
        >
          <p className="text-sm uppercase tracking-[0.22em] text-sky-300">PROMO OS</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Автономный помощник для продвижения твоей игры
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-lg">
            Подхватывает скриншоты из репозитория, готовит посты под каналы и проходит цикл: генерация,
            публикация, аналитика, оптимизация.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#workspace"
              className="rounded-md bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300"
            >
              Открыть рабочую зону
            </a>
            <button
              type="button"
              onClick={runDemoScenario}
              className="rounded-md border border-slate-600 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-400"
            >
              Запустить демо-сценарий
            </button>
          </div>
        </motion.div>
      </header>

      <main id="workspace" className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="border-b border-slate-800 pb-10"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">Быстрый запуск без тех-деталей</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Это режим для визуалиста: сначала заполни название, выбери каналы и изображения, затем нажми одну
            кнопку для запуска помощника.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-sky-400 transition-all" style={{ width: `${setupPercent}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-400">Готовность к запуску: {setupPercent}%</p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={quickStartAssistant}
              disabled={!hasChannels || isRunning}
              className="rounded-md bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              {isRunning ? "Помощник уже работает" : "Быстрый старт помощника"}
            </button>
            <button
              type="button"
              onClick={publishQueuedPosts}
              disabled={!hasPlan || isPublishingToX}
              className="rounded-md border border-slate-600 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              Отправить посты в автопубликацию
            </button>
            <button
              type="button"
              onClick={runDemoScenario}
              className="rounded-md border border-slate-700 px-5 py-3 font-medium text-slate-200 transition hover:border-slate-500"
            >
              Показать демо на примере
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="border-b border-slate-800 pb-10"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">1) О проекте</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Заполни бриф, выбери каналы и режим автономности. Эти параметры определяют поведение помощника.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Название продукта</span>
              <input
                value={campaign.productName}
                onChange={(event) => updateCampaign("productName", event.target.value)}
                placeholder="Например: Neon Core"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Жанр</span>
              <input
                value={campaign.genre}
                onChange={(event) => updateCampaign("genre", event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-slate-300">Аудитория</span>
              <textarea
                value={campaign.audience}
                onChange={(event) => updateCampaign("audience", event.target.value)}
                rows={2}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Цель</span>
              <input
                value={campaign.objective}
                onChange={(event) => updateCampaign("objective", event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Tone of Voice</span>
              <input
                value={campaign.tone}
                onChange={(event) => updateCampaign("tone", event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {Object.entries(channelLabels).map(([channel, label]) => {
              const checked = campaign.channels.includes(channel as Channel);
              return (
                <label key={channel} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChannel(channel as Channel)}
                    className="h-4 w-4 accent-sky-400"
                  />
                  <span className="text-slate-300">{label}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {(Object.keys(modeLabels) as AutopilotMode[]).map((mode) => (
              <label key={mode} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="autopilot-mode"
                  checked={autopilotMode === mode}
                  onChange={() => setAutopilotMode(mode)}
                  className="h-4 w-4 accent-sky-400"
                />
                <span className="text-slate-300">{modeLabels[mode]}</span>
              </label>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-300">Стиль продающих текстов</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(Object.keys(copyStyleLabels) as CopyStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setCopyStyle(style)}
                  className={`rounded-md border px-4 py-2 text-sm transition ${
                    copyStyle === style
                      ? "border-sky-400 bg-sky-400/10 text-sky-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {copyStyleLabels[style]}
                </button>
              ))}
            </div>
            <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={smartAssist}
                onChange={(event) => setSmartAssist(event.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
              Smart помощник: сам усиливает хук, CTA и качество текста
            </label>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="border-b border-slate-800 py-10"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">2) Картинки и скриншоты</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Выбирай скриншоты из `materials/` или загружай новые. Помощник использует эти ассеты в текстах и
            креативах для публикаций.
          </p>

          <div className="mt-6">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-500">
              Добавить локальные скриншоты
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleUpload(event.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {repoAssets.length === 0 ? (
            <p className="mt-6 text-sm text-amber-300">
              В текущей локальной копии не найдено файлов в `materials/`. После обновления репозитория они
              появятся автоматически.
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...hydratedRepoAssets, ...uploadedAssets].map((asset) => {
              const isChecked =
                asset.source === "repo"
                  ? selectedRepoAssetIds.includes(asset.id)
                  : uploadedAssets.some((uploadedAsset) => uploadedAsset.id === asset.id);

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    if (asset.source === "repo") {
                      void ensureRepoAssetUrl(asset.id);
                      toggleRepoAsset(asset.id);
                    }
                  }}
                  className={`relative overflow-hidden rounded-md border text-left transition ${
                    isChecked ? "border-sky-400" : "border-slate-700"
                  } ${asset.source === "upload" ? "cursor-default" : "cursor-pointer"}`}
                >
                  {asset.url ? (
                    <img src={asset.url} alt={asset.name} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-slate-900 text-xs uppercase tracking-wide text-slate-500">
                      Нажми для загрузки превью
                    </div>
                  )}
                  <div className="flex items-center justify-between bg-slate-900 px-3 py-2 text-sm text-slate-200">
                    <span className="truncate">{asset.name}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">{asset.source}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="border-b border-slate-800 py-10"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">3) Создать и запустить посты</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Базовый сценарий: сгенерировать посты, затем запустить помощника, затем отправить в автопубликацию.
          </p>

          <details className="mt-6 rounded-md border border-slate-800 bg-slate-900/50 p-4">
            <summary className="cursor-pointer text-sm text-slate-300">Продвинутые настройки генерации (LLM)</summary>
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                value={llmPreset}
                onChange={(event) => applyLlmPreset(event.target.value as LlmPreset)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400"
              >
                <option value="openai">Preset: OpenAI</option>
                <option value="openrouter">Preset: OpenRouter</option>
                <option value="groq">Preset: Groq</option>
              </select>
              <button
                type="button"
                onClick={() => applyLlmPreset(llmPreset)}
                className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500"
              >
                Применить preset
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-400">Provider format</span>
                <select
                  value={llmSettings.provider}
                  onChange={(event) => setLlmSettings((prev) => ({ ...prev, provider: event.target.value as LLMProvider }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
                >
                  <option value="responses">Responses API</option>
                  <option value="chat">Chat Completions API</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-slate-400">Model</span>
                <input
                  value={llmSettings.model}
                  onChange={(event) => setLlmSettings((prev) => ({ ...prev, model: event.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-400">Endpoint</span>
                <input
                  value={llmSettings.endpoint}
                  onChange={(event) => setLlmSettings((prev) => ({ ...prev, endpoint: event.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-slate-400">System prompt</span>
                <textarea
                  rows={3}
                  value={llmSettings.systemPrompt}
                  onChange={(event) => setLlmSettings((prev) => ({ ...prev, systemPrompt: event.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
                />
              </label>
            </div>
          </details>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={generateCampaignPlan}
              disabled={campaign.channels.length === 0}
              className="rounded-md bg-sky-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              Сгенерировать контент-план
            </button>
            <button
              type="button"
              onClick={runCurrentPlan}
              disabled={posts.length === 0 || isRunning}
              className="rounded-md border border-slate-600 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              {isRunning ? "Автопилот работает" : "Запустить помощника"}
            </button>
            <button
              type="button"
              onClick={generateWithLLM}
              disabled={isLlmGenerating}
              className="rounded-md border border-violet-500 px-5 py-3 font-medium text-violet-300 transition hover:border-violet-400 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              {isLlmGenerating ? "Генерируем" : "Умная генерация (LLM)"}
            </button>
            <button
              type="button"
              onClick={publishQueuedPosts}
              disabled={isPublishingToX}
              className="rounded-md border border-slate-500 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              {isPublishingToX ? "Ставим задачи в очередь" : "Отправить в автопубликацию (X/Discord/Reddit)"}
            </button>
            {awaitingApproval ? (
              <button
                type="button"
                onClick={approvePublication}
                className="rounded-md border border-emerald-500 px-5 py-3 font-medium text-emerald-300 transition hover:border-emerald-400"
              >
                Подтвердить публикацию
              </button>
            ) : null}
          </div>

          {llmError ? <p className="mt-4 text-sm text-rose-300">{llmError}</p> : null}
          {xPublishError ? <p className="mt-2 text-sm text-rose-300">{xPublishError}</p> : null}
          {backendUnavailable ? (
            <p className="mt-2 text-sm text-amber-300">
              Сейчас помощник работает в упрощенном локальном режиме. Это нормально: посты все равно будут
              генерироваться и ты сможешь продолжать без технической настройки.
            </p>
          ) : null}

          {activeJob ? (
            <div className="mt-4 rounded-md border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  Статус отправки: {activeJob.status} | попыток: {activeJob.attempts}
                </p>
                <button
                  type="button"
                  onClick={() => refreshJobStatus(activeJob.id)}
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500"
                >
                  Обновить статус
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">ID задачи: {activeJob.id}</p>
              {activeJob.error ? <p className="mt-2 text-rose-300">{activeJob.error}</p> : null}
            </div>
          ) : null}

          <motion.div className="mt-8 space-y-4" layout>
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-md border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm uppercase tracking-wide text-sky-300">{channelLabels[post.channel]}</p>
                  <p className="text-sm text-slate-400">{post.publishAt}</p>
                </div>
                <h3 className="mt-2 text-lg font-medium text-slate-100">{post.headline}</h3>
                <p className="mt-2 text-slate-300">{post.body}</p>
                <p className="mt-3 text-sm text-emerald-300">CTA: {post.cta}</p>
              </motion.article>
            ))}
          </motion.div>

          {activityLog.length > 0 ? (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-lg font-medium">Логи помощника</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                {activityLog.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}

          {xPublishResults.length > 0 ? (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-lg font-medium">Результат enqueue в publish router</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                {xPublishResults.map((item) => (
                  <p key={item.id}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200">
                        {item.id}
                      </a>
                    ) : (
                      <span className="text-sky-300">{item.id}</span>
                    )}
                    {` - ${item.text}`}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="py-10"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">4) Что происходит после запуска</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Здесь отображается прогресс pipeline. После завершения появляются метрики по каждому каналу.
          </p>

          {queue.length === 0 ? (
            <p className="mt-6 text-slate-400">Сгенерируй контент-план, чтобы увидеть шаги цикла.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {queue.map((step, index) => {
                const color =
                  step.status === "done"
                    ? "bg-emerald-400"
                    : step.status === "active"
                      ? "bg-sky-400"
                      : "bg-slate-700";

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <p className="text-slate-200">{step.title}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {metrics.length > 0 ? (
            <div className="mt-8 overflow-x-auto border-t border-slate-800 pt-6">
              <h3 className="text-lg font-medium">Mock-метрики кампании</h3>
              <table className="mt-3 min-w-full text-left text-sm text-slate-300">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-2 pr-6">Канал</th>
                    <th className="py-2 pr-6">Impressions</th>
                    <th className="py-2 pr-6">Clicks</th>
                    <th className="py-2 pr-6">CTR</th>
                    <th className="py-2">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.channel} className="border-t border-slate-800">
                      <td className="py-2 pr-6">{channelLabels[metric.channel]}</td>
                      <td className="py-2 pr-6">{metric.impressions}</td>
                      <td className="py-2 pr-6">{metric.clicks}</td>
                      <td className="py-2 pr-6">{metric.ctr}</td>
                      <td className="py-2">{metric.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {queuePayloadText ? (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-medium">Экспорт очереди в JSON</h3>
                <button
                  type="button"
                  onClick={downloadQueueJson}
                  className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-400"
                >
                  Скачать queue payload
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Этот JSON можно отправлять в твой worker для автопостинга или в n8n/Make сценарий.
              </p>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-slate-300">Показать технический JSON</summary>
                <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-300">
                  {queuePayloadText}
                </pre>
              </details>
            </div>
          ) : null}
        </motion.section>
      </main>
    </div>
  );
}
