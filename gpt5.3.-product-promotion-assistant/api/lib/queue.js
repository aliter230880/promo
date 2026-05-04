import crypto from "node:crypto";
import { getRuntimeStore } from "./runtime-state.js";

function nowIso() {
  return new Date().toISOString();
}

export function getOrCreateJob({ idempotencyKey, type, payload }) {
  const store = getRuntimeStore();
  if (idempotencyKey && store.idempotency.has(idempotencyKey)) {
    const jobId = store.idempotency.get(idempotencyKey);
    return store.jobs.get(jobId);
  }

  const id = crypto.randomUUID();
  const job = {
    id,
    type,
    status: "queued",
    attempts: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    payload,
    result: null,
    error: null
  };

  store.jobs.set(id, job);
  if (idempotencyKey) {
    store.idempotency.set(idempotencyKey, id);
  }
  return job;
}

export function updateJob(job, patch) {
  const store = getRuntimeStore();
  const next = {
    ...job,
    ...patch,
    updatedAt: nowIso()
  };
  store.jobs.set(job.id, next);
  return next;
}

export async function withRetry(task, options = {}) {
  const maxAttempts = Number(options.maxAttempts || 3);
  const baseMs = Number(options.baseMs || 600);

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await task(attempt);
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      if (typeof options.onRetry === "function") {
        options.onRetry({ attempt, error });
      }
      const delay = baseMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Retry loop exited unexpectedly");
}
