import { Worker } from "bullmq";
import { getBullConnection, getQueueName } from "../api/lib/bullmq.js";
import { processPublishJob } from "../api/lib/publish-job.js";

async function startWorker() {
  const worker = new Worker(
    getQueueName(),
    async (job) => {
      return processPublishJob(job.data);
    },
    {
      connection: getBullConnection(),
      concurrency: 4
    }
  );

  worker.on("completed", (job, result) => {
    console.log(`[worker] completed ${job.id}`, result?.channel || "");
  });

  worker.on("failed", (job, error) => {
    console.error(`[worker] failed ${job?.id || "unknown"}: ${error.message}`);
  });

  console.log(`[worker] started queue=${getQueueName()}`);
}

startWorker().catch((error) => {
  console.error("[worker] fatal error", error);
  process.exit(1);
});
