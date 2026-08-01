import { Queue } from "bullmq";

export const winbackQueue = new Queue("winback-emails", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

