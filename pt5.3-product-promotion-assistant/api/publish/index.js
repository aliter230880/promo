import crypto from "node:crypto";
import { getPublishQueue, hasRedisConfig } from "../lib/bullmq.js";

const SUPPORTED_CHANNELS = new Set(["x", "discord", "reddit"]);

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

function parseIsoDate(raw) {
  if (typeof raw !== "string") {
    return null;
  }
  const timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return new Date(timestamp);
}

function normalizePosts(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const channel = String(item.channel || "").toLowerCase();
      if (!SUPPORTED_CHANNELS.has(channel)) {
        return null;
      }

      return {
        channel,
        sourcePostId: typeof item.sourcePostId === "string" ? item.sourcePostId : "",
        text: typeof item.text === "string" ? item.text.trim() : "",
        title: typeof item.title === "string" ? item.title.trim() : "",
        body: typeof item.body === "string" ? item.body.trim() : "",
        subreddit: typeof item.subreddit === "string" ? item.subreddit.trim() : "",
        scheduleAt: parseIsoDate(item.scheduleAt)
      };
    })
    .filter(Boolean)
    .filter((post) => post.text || (post.channel === "reddit" && post.title && post.body));
}

function getAutoplanIntervalMs() {
  const raw = Number(process.env.AUTOPLAN_INTERVAL_MINUTES || 20);
  const minutes = Number.isFinite(raw) && raw > 0 ? raw : 20;
  return minutes * 60 * 1000;
}

function makeJobId({ idempotencyKey, index, post }) {
  const base = `${idempotencyKey || "publish"}:${index}:${post.channel}:${post.sourcePostId || post.text}`;
  return `pub-${crypto.createHash("sha1").update(base).digest("hex")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  if (!hasRedisConfig()) {
    res.status(500).json({ ok: false, error: "REDIS_URL is required for persistent queue" });
    return;
  }

  const body = parseBody(req);
  const posts = normalizePosts(body.posts);
  const idempotencyKey = String(req.headers["x-idempotency-key"] || "");
  const autoplan = body.autoplan !== false;

  if (posts.length === 0) {
    res.status(400).json({ ok: false, error: "Request must include posts[] with supported channels" });
    return;
  }

  try {
    const queue = getPublishQueue();
    const intervalMs = getAutoplanIntervalMs();
    const now = Date.now();
    const enqueued = [];

    for (let index = 0; index < posts.length; index += 1) {
      const post = posts[index];
      const baseScheduledAt = post.scheduleAt ? post.scheduleAt.getTime() : now;
      const autoplanOffset = autoplan ? index * intervalMs : 0;
      const scheduledAtMs = Math.max(now, baseScheduledAt + autoplanOffset);
      const delay = Math.max(0, scheduledAtMs - now);
      const jobId = makeJobId({ idempotencyKey, index, post });

      const existing = await queue.getJob(jobId);
      if (existing) {
        enqueued.push({ id: existing.id, channel: post.channel, delay, scheduledAt: new Date(scheduledAtMs).toISOString(), deduped: true });
        continue;
      }

      const job = await queue.add(
        "publish-post",
        {
          channel: post.channel,
          text: post.text,
          title: post.title,
          body: post.body,
          subreddit: post.subreddit,
          sourcePostId: post.sourcePostId
        },
        {
          jobId,
          delay,
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 }
        }
      );

      enqueued.push({ id: job.id, channel: post.channel, delay, scheduledAt: new Date(scheduledAtMs).toISOString(), deduped: false });
    }

    res.status(200).json({ ok: true, queued: enqueued.length, jobs: enqueued });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enqueue jobs";
    res.status(500).json({ ok: false, error: message });
  }
}
