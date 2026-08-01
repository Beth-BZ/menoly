import { Worker } from "bullmq";

const worker = new Worker(
  "winback-emails",
  async (job) => {
    console.log(`Processing job for ${job.data.name} (${job.data.email})`);
    console.log(`Would send win-back email to ${job.data.email}`);
  },
  {
    connection: { host: "localhost", port: 6379 },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`);
});
