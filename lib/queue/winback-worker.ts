import { Worker } from "bullmq";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const worker = new Worker(
  "winback-emails",
  async (job) => {
    const { name, email } = job.data;

    console.log(`Sending win-back email to ${email}`);

    const { data, error } = await resend.emails.send({
      from: "Menoly <onboarding@resend.dev>",
      to: email,
      subject: "We miss you!",
      html: `<p>Hi ${name || "there"},</p><p>We noticed you haven't shopped with us in a while — here's 15% off to welcome you back.</p>`,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Email sent, id: ${data?.id}`);
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
