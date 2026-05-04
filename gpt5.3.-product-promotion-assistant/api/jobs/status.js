import { getRuntimeStore } from "../lib/runtime-state.js";
import { getPublishQueue, hasRedisConfig } from "../lib/bullmq.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) {
    res.status(400).json({ ok: false, error: "Missing query param id" });
    return;
  }

  if (hasRedisConfig()) {
    try {
      const queue = getPublishQueue();
      const redisJob = await queue.getJob(id);
      if (redisJob) {
        const state = await redisJob.getState();
        res.status(200).json({
          ok: true,
          job: {
            id: String(redisJob.id),
            type: redisJob.name,
            status: state,
            attempts: redisJob.attemptsMade,
            createdAt: new Date(redisJob.timestamp).toISOString(),
            updatedAt: new Date(redisJob.processedOn || redisJob.timestamp).toISOString(),
            error: redisJob.failedReason || null,
            result: redisJob.returnvalue || null
          }
        });
        return;
      }
    } catch {
      // Fallback to runtime store for non-Bull jobs.
    }
  }

  const store = getRuntimeStore();
  const job = store.jobs.get(id);
  if (!job) {
    res.status(404).json({ ok: false, error: "Job not found" });
    return;
  }

  res.status(200).json({
    ok: true,
    job: {
      id: job.id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      error: job.error,
      result: job.result
    }
  });
}
