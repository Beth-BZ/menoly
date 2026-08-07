import { Queue } from "bullmq";

export const winbackQueue = new Queue("winback-emails", {
  connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
});
