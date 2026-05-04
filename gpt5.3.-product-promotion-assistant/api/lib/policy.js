import crypto from "node:crypto";
import { getRuntimeStore } from "./runtime-state.js";

const DEFAULT_STOP_WORDS = ["scam", "pump", "100% guarantee", "casino", "betting", "adult"]; 

function getNumberEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getStopWords() {
  const fromEnv = process.env.PUBLISH_STOP_WORDS;
  if (!fromEnv) {
    return DEFAULT_STOP_WORDS;
  }
  return fromEnv
    .split(",")
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
}

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function textContainsStopWord(text) {
  const normalized = text.toLowerCase();
  const stopWords = getStopWords();
  for (const word of stopWords) {
    if (normalized.includes(word)) {
      return word;
    }
  }
  return null;
}

export function validateAntiSpam(text) {
  if (typeof text !== "string" || !text.trim()) {
    return "Пустой текст поста";
  }

  const stopWord = textContainsStopWord(text);
  if (stopWord) {
    return `Запрещенное слово: ${stopWord}`;
  }

  if (/([!?.,])\1{4,}/.test(text)) {
    return "Слишком агрессивная пунктуация";
  }

  return null;
}

export function checkPublishLimits({ channel, text }) {
  const store = getRuntimeStore();
  const now = Date.now();
  const maxPerDay = getNumberEnv("PUBLISH_MAX_POSTS_PER_DAY", 20);
  const cooldownSeconds = getNumberEnv("PUBLISH_COOLDOWN_SECONDS", 900);
  const duplicateWindowHours = getNumberEnv("PUBLISH_DUPLICATE_WINDOW_HOURS", 48);
  const duplicateWindowMs = duplicateWindowHours * 60 * 60 * 1000;

  const events = store.channelEvents.get(channel) || [];
  const recentDay = events.filter((timestamp) => now - timestamp < 24 * 60 * 60 * 1000);
  const lastPublish = recentDay[recentDay.length - 1];

  if (recentDay.length >= maxPerDay) {
    return `Достигнут лимит ${maxPerDay} постов/24ч для канала ${channel}`;
  }

  if (lastPublish && now - lastPublish < cooldownSeconds * 1000) {
    return `Cooldown активен: подожди ${cooldownSeconds} секунд`;
  }

  const hash = sha(text.toLowerCase());
  const hashInfo = store.postHashes.get(`${channel}:${hash}`);
  if (hashInfo && now - hashInfo.timestamp < duplicateWindowMs) {
    return "Похоже на дублирующийся пост";
  }

  return null;
}

export function recordPublished({ channel, text }) {
  const store = getRuntimeStore();
  const now = Date.now();
  const events = store.channelEvents.get(channel) || [];
  events.push(now);
  store.channelEvents.set(channel, events);

  const hash = sha(text.toLowerCase());
  store.postHashes.set(`${channel}:${hash}`, { timestamp: now });
}
