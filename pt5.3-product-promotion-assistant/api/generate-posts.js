import { getOrCreateJob, updateJob, withRetry } from "./lib/queue.js";
import { validateAntiSpam } from "./lib/policy.js";

const ALLOWED_CHANNELS = new Set(["steam", "reddit", "x", "tiktok", "discord"]);

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

function parsePosts(rawText, channels) {
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

    normalized.push({
      id: `${channel}-ai-${index}`,
      channel,
      headline,
      body,
      cta,
      publishAt
    });
  });

  if (normalized.length === 0) {
    throw new Error("Все посты отфильтрованы анти-спам правилами");
  }

  return normalized;
}

function buildUserPrompt({ campaign, channels, assets }) {
  const channelText = channels.join(", ");
  const assetText = assets.length > 0 ? assets.map((asset) => asset.name).join(", ") : "нет";

  return `
Собери посты для продвижения игры. Верни только JSON с форматом:
{
  "posts": [
    {"channel":"steam|reddit|x|tiktok|discord","headline":"","body":"","cta":"","publishAt":""}
  ]
}

Требования:
- channels: используй только выбранные каналы
- headline до 90 символов
- body 1-3 предложения
- без эмодзи и без кликбейта
- стиль: ${campaign.tone}

Данные кампании:
- productName: ${campaign.productName || "Unknown product"}
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
  const channels = Array.isArray(body?.channels) ? body.channels.filter((channel) => ALLOWED_CHANNELS.has(channel)) : [];
  const assets = Array.isArray(body?.assets) ? body.assets : [];
  const idempotencyKey = req.headers["x-idempotency-key"] || "";

  if (!campaign || !llmSettings || channels.length === 0) {
    res.status(400).json({ ok: false, error: "Missing campaign, llmSettings or channels" });
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

  const prompt = buildUserPrompt({ campaign, channels, assets });
  const providerPayload =
    llmSettings.provider === "responses"
      ? {
          model: llmSettings.model,
          temperature: llmSettings.temperature,
          input: [
            { role: "system", content: llmSettings.systemPrompt },
            { role: "user", content: prompt }
          ]
        }
      : {
          model: llmSettings.model,
          temperature: llmSettings.temperature,
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
    const posts = parsePosts(rawText, channels);
    job = updateJob(job, { status: "completed", result: { posts }, error: null });
    res.status(200).json({ ok: true, jobId: job.id, status: job.status, posts });
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/^retriable:/, "") : "LLM generation failed";
    job = updateJob(job, { status: "failed", error: message });
    res.status(500).json({ ok: false, jobId: job.id, status: job.status, error: message });
  }
}
