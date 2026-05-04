import { checkPublishLimits, recordPublished, validateAntiSpam } from "./policy.js";
import { publishToDiscord, publishToReddit, publishToX } from "./publish-targets.js";

function makeCombinedText(jobData) {
  if (jobData.channel === "reddit") {
    return `${jobData.title || ""} ${jobData.body || jobData.text || ""}`.trim();
  }
  return String(jobData.text || "").trim();
}

export async function processPublishJob(jobData) {
  const channel = String(jobData.channel || "").toLowerCase();
  const combinedText = makeCombinedText(jobData);

  const antiSpamError = validateAntiSpam(combinedText);
  if (antiSpamError) {
    throw new Error(`Anti-spam: ${antiSpamError}`);
  }

  const limitError = checkPublishLimits({ channel, text: combinedText });
  if (limitError) {
    throw new Error(`Limit: ${limitError}`);
  }

  let result;
  if (channel === "x") {
    result = await publishToX(jobData);
  } else if (channel === "discord") {
    result = await publishToDiscord(jobData);
  } else if (channel === "reddit") {
    result = await publishToReddit(jobData);
  } else {
    throw new Error(`Unsupported channel: ${channel}`);
  }

  recordPublished({ channel, text: combinedText });
  return result;
}
