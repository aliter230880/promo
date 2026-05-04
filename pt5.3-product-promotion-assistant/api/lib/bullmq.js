import IORedis from "ioredis";
import { Queue } from "bullmq";

const QUEUE_NAME = "promo-publish";
const REDIS_ERROR = "REDIS_URL is not configured";

function getRedisUrl() {
  const url = process.env.REDIS_URL;
  return typeof url === "string" ? url.trim() : "";
}

function getState() {
  if (!globalThis.__promo_bullmq_state__) {
    globalThis.__promo_bullmq_state__ = {
      connection: null,
      queue: null
    };
  }
  return globalThis.__promo_bullmq_state__;
}

export function hasRedisConfig() {
  return Boolean(getRedisUrl());
}

export function getQueueName() {
  return QUEUE_NAME;
}

export function getBullConnection() {
  const state = getState();
  if (state.connection) {
    return state.connection;
  }

  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error(REDIS_ERROR);
  }

  state.connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });

  return state.connection;
}

export function getPublishQueue() {
  const state = getState();
  if (state.queue) {
    return state.queue;
  }

  state.queue = new Queue(QUEUE_NAME, {
    connection: getBullConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000
      },
      removeOnComplete: 200,
      removeOnFail: 200
    }
  });

  return state.queue;
}
