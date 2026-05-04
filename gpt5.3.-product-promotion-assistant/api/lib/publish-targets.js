import crypto from "node:crypto";
import OAuth from "oauth-1.0a";

const X_POST_TWEET_URL = "https://api.x.com/2/tweets";

function getEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function makeOauth(consumerKey, consumerSecret) {
  return new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    }
  });
}

export async function publishToX(post) {
  const consumerKey = getEnv("X_CONSUMER_KEY");
  const consumerSecret = getEnv("X_CONSUMER_SECRET");
  const accessToken = getEnv("X_ACCESS_TOKEN");
  const accessTokenSecret = getEnv("X_ACCESS_TOKEN_SECRET");

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    throw new Error("Missing X credentials in environment variables");
  }

  const oauth = makeOauth(consumerKey, consumerSecret);
  const token = { key: accessToken, secret: accessTokenSecret };
  const requestData = { url: X_POST_TWEET_URL, method: "POST" };
  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));
  const text = String(post.text || "").replace(/\s+/g, " ").trim().slice(0, 280);

  const response = await fetch(X_POST_TWEET_URL, {
    method: "POST",
    headers: {
      ...authHeader,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.detail || data?.title || `X API HTTP ${response.status}`;
    throw new Error(message);
  }

  const tweetId = data?.data?.id;
  return {
    channel: "x",
    id: tweetId,
    text,
    url: tweetId ? `https://x.com/i/web/status/${tweetId}` : ""
  };
}

export async function publishToDiscord(post) {
  const webhookUrl = getEnv("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) {
    throw new Error("Missing DISCORD_WEBHOOK_URL");
  }

  const text = String(post.text || "").trim().slice(0, 1900);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text })
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Discord webhook HTTP ${response.status}: ${raw.slice(0, 160)}`);
  }

  return {
    channel: "discord",
    id: `discord-${Date.now()}`,
    text,
    url: ""
  };
}

export async function publishToReddit(post) {
  const accessToken = getEnv("REDDIT_ACCESS_TOKEN");
  const subreddit = String(post.subreddit || getEnv("REDDIT_SUBREDDIT") || "").replace(/^r\//i, "");
  if (!accessToken || !subreddit) {
    throw new Error("Missing REDDIT_ACCESS_TOKEN or REDDIT_SUBREDDIT");
  }

  const title = String(post.title || "").trim().slice(0, 280);
  const body = String(post.body || post.text || "").trim().slice(0, 39000);
  if (!title || !body) {
    throw new Error("Reddit requires title and body");
  }

  const params = new URLSearchParams({
    api_type: "json",
    kind: "self",
    sr: subreddit,
    title,
    text: body
  });

  const response = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Reddit HTTP ${response.status}`);
  }

  const errors = data?.json?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(`Reddit error: ${JSON.stringify(errors)}`);
  }

  return {
    channel: "reddit",
    id: `reddit-${Date.now()}`,
    text: `${title} ${body}`,
    url: `https://reddit.com/r/${subreddit}/new`
  };
}
