import crypto from "node:crypto";
import { getPublishQueue, hasRedisConfig } from "../lib/bullmq.js";

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

function normalizePosts(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const text = typeof item.text === "string" ? item.text.replace(/\s+/g, " ").trim() : "";
      if (!text) {
        return null;
      }

      return {
        channel: "x",
        text: text.length > 280 ? `${text.slice(0, 277)}...` : text,
        sourcePostId: typeof item.sourcePostId === "string" ? item.sourcePostId : ""
      };
    })
    .filter(Boolean);
}

function makeJobId(idempotencyKey, index, payload) {
  const base = `${idempotencyKey || "x-direct"}:${index}:${payload.sourcePostId || payload.text}`;
  return `x-${crypto.createHash("sha1").update(base).digest("hex")}`;
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

  const payload = parseBody(req);
  const posts = normalizePosts(payload.posts);
  const idempotencyKey = req.headers["x-idempotency-key"] || "";

  if (posts.length === 0) {
    res.status(400).json({ ok: false, error: "Request body must include posts: [{ text }]" });
    return;
  }


  try {
    const queue = getPublishQueue();
    const jobs = [];

    for (let index = 0; index < posts.length; index += 1) {
      const post = posts[index];
      const jobId = makeJobId(String(idempotencyKey), index, post);
      const existing = await queue.getJob(jobId);
      if (existing) {
        jobs.push(existing);
        continue;
      }

      const created = await queue.add(
        "publish-post",
        {
          channel: "x",
          text: post.text,
          sourcePostId: post.sourcePostId
        },
        {
          jobId,
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 }
        }
      );
      jobs.push(created);
    }

    res.status(200).json({
      ok: true,
      queued: jobs.length,
      jobs: jobs.map((job) => ({ id: job.id, state: "queued" }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to enqueue X jobs";
    res.status(500).json({ ok: false, error: message });
  }
}
