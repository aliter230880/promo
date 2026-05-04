import { getOrCreateJob, updateJob, withRetry } from "./lib/queue.js";
import { validateAntiSpam } from "./lib/policy.js";

const ALLOWED_CHANNELS = new Set(["steam", "reddit", "x", "tiktok", "discord"]);
const BAD_PHRASES = ["unknown product", "нашему проекту", "project", "игра", "без заголовка", "lorem ipsum"];
const STYLE_RULES = {
  performance: {
    tone: "Максимально конверсионный, быстрый, напористый.",
    cta: "Жесткий CTA на клик, wishlist или подписку.",
    banned: "Запрещена лирика и размытые формулировки."
  },
  community: {
    tone: "Дружелюбный и вовлекающий тон без давления.",
    cta: "CTA на диалог, фидбек и участие комьюнити.",
    banned: "Запрещены агрессивные продающие обещания."
  },
  premium: {
    tone: "Сдержанный премиальный тон, фокус на качестве и атмосфере.",
    cta: "CTA деликатный, но уверенный.",
    banned: "Запрещен сленг и дешевые маркетинговые трюки."
  }
};

function parseBody(req) {
  if (!req.body) {
    return {};
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function pickApiKey(endpoint) {
  const normalized = String(endpoint || "").toLowerCase();
  if (normalized.includes("openrouter.ai")) {
    return process.env.OPENROUTER_API_KEY || "";
  }
  if (normalized.includes("groq.com")) {
    return process.env.GROQ_API_KEY || "";
  }
  return process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || "";
}

function extractAssistantText(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  if (typeof payload.output_text === "string" && payload.output_text.length > 0) {
    return payload.output_text;
  }

  if (Array.isArray(payload.choices) && payload.choices.length > 0) {
    const content = payload.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }
  }

  if (Array.isArray(payload.output)) {
    for (const block of payload.output) {
      const content = block?.content;
      if (!Array.isArray(content)) {
        continue;
      }
      for (const part of content) {
        if (typeof part?.text === "string") {
          return part.text;
        }
      }
    }
  }

  return "";
}

function extractJsonString(raw) {
  const cleaned = String(raw || "").replace(/```json|```/gi, "").trim();
  const firstObject = cleaned.indexOf("{");
  const firstArray = cleaned.indexOf("[");
  const start =
    firstObject === -1 ? firstArray : firstArray === -1 ? firstObject : Math.min(firstObject, firstArray);
  const lastObject = cleaned.lastIndexOf("}");
  const lastArray = cleaned.lastIndexOf("]");
  const end = Math.max(lastObject, lastArray);
  if (start === -1 || end === -1 || end < start) {
    return cleaned;
  }
  return cleaned.slice(start, end + 1);
}

function makePublishTime(index) {
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

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeObjective(rawObjective) {
  const value = cleanText(rawObjective);
  if (!value) {
    return "рост wishlist и целевых переходов";
  }
  if (/пользовател/i.test(value)) {
    return "рост целевых подписок и wishlist";
  }
  return value;
}

function improvePost(post, campaign, stylePreset) {
  const product = cleanText(campaign.productName);
  const objective = cleanText(campaign.objective);
  const style = STYLE_RULES[stylePreset] || STYLE_RULES.performance;

  const headline = post.headline.includes(product) ? post.headline : `${product}: ${post.headline}`;
  const bodyWithObjective = post.body.toLowerCase().includes(objective.toLowerCase())
    ? post.body
    : `${post.body} Фокус этой публикации: ${objective}.`;

  const cta =
    post.cta.length >= 8
      ? post.cta
      : stylePreset === "community"
        ? "Напиши мнение и присоединяйся к обсуждению"
        : stylePreset === "premium"
          ? "Открой страницу проекта и оцени атмосферу"
          : "Перейди на страницу и добавь в wishlist";

  return {
    ...post,
    headline: cleanText(headline).slice(0, 85),
    body: cleanText(bodyWithObjective),
    cta: cleanText(cta)
  };
}

function fallbackBodyByChannel(channel, campaign, assetHint) {
  const objective = normalizeObjective(campaign.objective);
  const genre = cleanText(campaign.genre);
  const audience = cleanText(campaign.audience);
  const product = cleanText(campaign.productName);

  if (channel === "x") {
    return `${product}: короткий, но сильный хук с акцентом на ценность для игрока. Цель публикации: ${objective}. ${assetHint}`;
  }

  if (channel === "reddit") {
    return `Ищем честный фидбек от аудитории ${audience}. Что в ${product} цепляет сильнее: темп боя, прогрессия или разнообразие билдов? ${assetHint}`;
  }

  if (channel === "steam") {
    return `${product} в жанре ${genre} получил обновление с более читаемым боем и понятной прогрессией. Фокус: ${objective}. ${assetHint}`;
  }

  if (channel === "tiktok") {
    return `Сценарий ролика: быстрый хук, ключевая механика и финальный payoff, который хочется повторить. ${assetHint}`;
  }

  return `${product} weekly update: что улучшили, что тестируем дальше и какой фидбек нужен прямо сейчас. ${assetHint}`;
}

function buildFallbackPosts(campaign, channels, assets) {
  const product = cleanText(campaign.productName) || "Новый тайтл";
  const assetHint = assets.length > 0 ? `Первый визуал: ${assets[0].name}.` : "Используй самый сильный скриншот с ключевой механикой.";

  return channels.map((channel, index) => {
    const headlineMap = {
      x: `${product}: момент, который стоит добавить в wishlist`,
      reddit: `Нужен фидбек по ${product}: что улучшить перед следующим билдом`,
      steam: `${product}: новый апдейт и шаг к релизу`,
      tiktok: `${product}: короткий gameplay hook для новой аудитории`,
      discord: `${product}: weekly update для сообщества`
    };

    const ctaMap = {
      x: "Перейти на страницу игры",
      reddit: "Оставить мнение в комментариях",
      steam: "Добавить в wishlist",
      tiktok: "Открыть ссылку в профиле",
      discord: "Зайти в сервер и написать фидбек"
    };

    return {
      id: `${channel}-fallback-${index}`,
      channel,
      headline: headlineMap[channel],
      body: fallbackBodyByChannel(channel, campaign, assetHint),
      cta: ctaMap[channel],
      publishAt: makePublishTime(index + 1)
    };
  });
}

function isPostQualityLow(post, campaign) {
  const product = cleanText(campaign.productName).toLowerCase();
  const merged = `${post.headline} ${post.body} ${post.cta}`.toLowerCase();

  if (post.headline.length < 20 || post.body.length < 45) {
    return true;
  }

  if (BAD_PHRASES.some((phrase) => merged.includes(phrase))) {
    return true;
  }

  if (product && !merged.includes(product)) {
    return true;
  }

  return false;
}

function parsePosts(rawText, channels, campaign) {
  const parsed = JSON.parse(extractJsonString(rawText));
  const source = Array.isArray(parsed?.posts) ? parsed.posts : [];
  if (source.length === 0) {
    throw new Error("LLM не вернул posts[]");
  }

  const normalized = [];
  source.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const channel = typeof item.channel === "string" ? item.channel : "";
    if (!ALLOWED_CHANNELS.has(channel) || !channels.includes(channel)) {
      return;
    }

    const headline = typeof item.headline === "string" ? item.headline.trim() : "Без заголовка";
    const body = typeof item.body === "string" ? item.body.trim() : "";
    const cta = typeof item.cta === "string" ? item.cta.trim() : "Открыть страницу проекта";
    const publishAt = typeof item.publishAt === "string" ? item.publishAt.trim() : makePublishTime(index + 1);

    const antiSpamReason = validateAntiSpam(`${headline} ${body} ${cta}`);
    if (antiSpamReason) {
      return;
    }

    const draft = {
      id: `${channel}-ai-${index}`,
      channel,
      headline,
      body,
      cta,
      publishAt
    };

    if (isPostQualityLow(draft, campaign)) {
      return;
    }

    normalized.push(draft);
  });

  if (normalized.length === 0) {
    throw new Error("Все посты отфильтрованы анти-спам правилами");
  }

  return normalized;
}

function buildUserPrompt({ campaign, channels, assets, copyStyle, smartAssist }) {
  const channelText = channels.join(", ");
  const assetText = assets.length > 0 ? assets.map((asset) => asset.name).join(", ") : "нет";
  const productName = cleanText(campaign.productName);
  const style = STYLE_RULES[copyStyle] || STYLE_RULES.performance;

  const channelGuidelines = {
    x: "X: 1 сильный хук, 1 выгода, 1 CTA. Без воды.",
    reddit: "Reddit: честный вопрос к сообществу + конкретный контекст.",
    steam: "Steam: акцент на фичах апдейта и причины добавить в wishlist.",
    tiktok: "TikTok: сценарий короткого клипа с первым кадром-хуком.",
    discord: "Discord: тон комьюнити-апдейта, ощущение совместной разработки."
  };

  const activeGuidelines = channels.map((channel) => channelGuidelines[channel]).join("\n");

  return `
Ты senior performance copywriter в game marketing.

Задача: написать продающие посты, а не абстрактные тексты.
Верни только JSON с форматом:
{
  "posts": [
    {"channel":"steam|reddit|x|tiktok|discord","headline":"","body":"","cta":"","publishAt":""}
  ]
}

Требования:
- channels: используй только выбранные каналы
- headline до 85 символов
- body 2-3 коротких предложения с конкретной выгодой
- без эмодзи и без кликбейта
- без общих фраз вроде "наш проект" и "unknown product"
- в каждом посте явно используй название продукта: ${productName || "[НАЗВАНИЕ ОБЯЗАТЕЛЬНО]"}
- стиль: ${campaign.tone}
- стиль-компас: ${style.tone}
- CTA-правило: ${style.cta}
- ограничение: ${style.banned}
- smart режим: ${smartAssist ? "включен (усиливай хук и конкретику)" : "выключен"}

Канал-правила:
${activeGuidelines}

Данные кампании:
- productName: ${productName || "unknown"}
- genre: ${campaign.genre}
- audience: ${campaign.audience}
- objective: ${campaign.objective}
- channels: ${channelText}
- assets: ${assetText}
`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const body = parseBody(req);
  const campaign = body?.campaign;
  const llmSettings = body?.llmSettings;
  const copyStyle = ["performance", "community", "premium"].includes(body?.copyStyle) ? body.copyStyle : "performance";
  const smartAssist = body?.smartAssist !== false;
  const channels = Array.isArray(body?.channels) ? body.channels.filter((channel) => ALLOWED_CHANNELS.has(channel)) : [];
  const assets = Array.isArray(body?.assets) ? body.assets : [];
  const idempotencyKey = req.headers["x-idempotency-key"] || "";

  if (!campaign || !llmSettings || channels.length === 0) {
    res.status(400).json({ ok: false, error: "Missing campaign, llmSettings or channels" });
    return;
  }

  const productName = cleanText(campaign.productName);
  if (productName.length < 2) {
    res.status(400).json({ ok: false, error: "Заполни название продукта в шаге 'О проекте'" });
    return;
  }

  const endpoint = String(llmSettings.endpoint || "").trim();
  const apiKey = pickApiKey(endpoint);
  if (!apiKey) {
    res.status(500).json({ ok: false, error: "LLM API key is missing on server" });
    return;
  }

  let job = getOrCreateJob({
    idempotencyKey,
    type: "generate-posts",
    payload: { channels, model: llmSettings.model }
  });

  if (job.status === "completed") {
    res.status(200).json({ ok: true, idempotent: true, jobId: job.id, posts: job.result.posts });
    return;
  }

  if (job.status === "running") {
    res.status(202).json({ ok: false, jobId: job.id, status: job.status, error: "Job already running" });
    return;
  }

  job = updateJob(job, { status: "running", attempts: 0, error: null });

  const prompt = buildUserPrompt({ campaign, channels, assets, copyStyle, smartAssist });
  const temperature = Math.min(0.6, Math.max(0.1, Number(llmSettings.temperature || 0.4)));
  const providerPayload =
    llmSettings.provider === "responses"
      ? {
          model: llmSettings.model,
          temperature,
          input: [
            { role: "system", content: llmSettings.systemPrompt },
            { role: "user", content: prompt }
          ]
        }
      : {
          model: llmSettings.model,
          temperature,
          messages: [
            { role: "system", content: llmSettings.systemPrompt },
            { role: "user", content: prompt }
          ]
        };

  try {
    const data = await withRetry(
      async (attempt) => {
        job = updateJob(job, { attempts: attempt });

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(providerPayload)
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const retriable = response.status === 429 || response.status >= 500;
          const message = payload?.error?.message || payload?.detail || `HTTP ${response.status}`;
          if (retriable) {
            throw new Error(`retriable:${message}`);
          }
          throw new Error(message);
        }

        return payload;
      },
      {
        maxAttempts: 3,
        baseMs: 700,
        onRetry: ({ attempt, error }) => {
          job = updateJob(job, {
            status: "retrying",
            error: `Попытка ${attempt} не удалась: ${error.message}`
          });
        }
      }
    );

    const rawText = extractAssistantText(data);
    let posts = parsePosts(rawText, channels, campaign);
    if (posts.length < channels.length) {
      const fallback = buildFallbackPosts(campaign, channels, assets);
      const existingChannels = new Set(posts.map((post) => post.channel));
      const missing = fallback.filter((post) => !existingChannels.has(post.channel));
      posts = [...posts, ...missing];
    }

    if (smartAssist) {
      posts = posts.map((post) => improvePost(post, campaign, copyStyle));
    }

    job = updateJob(job, { status: "completed", result: { posts }, error: null });
    res.status(200).json({ ok: true, jobId: job.id, status: job.status, posts });
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/^retriable:/, "") : "LLM generation failed";

    try {
      const fallbackPosts = buildFallbackPosts(campaign, channels, assets);
      job = updateJob(job, {
        status: "completed",
        result: { posts: fallbackPosts, fallback: true },
        error: `LLM fallback: ${message}`
      });
      res.status(200).json({ ok: true, jobId: job.id, status: job.status, posts: fallbackPosts, fallback: true });
      return;
    } catch {
      job = updateJob(job, { status: "failed", error: message });
      res.status(500).json({ ok: false, jobId: job.id, status: job.status, error: message });
    }
  }
}
