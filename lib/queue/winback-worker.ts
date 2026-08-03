import { Worker } from "bullmq";
import { Resend } from "resend";
import { prisma } from "../rfm-core";

const resend = new Resend(process.env.RESEND_API_KEY);

const worker = new Worker(
  "winback-emails",
  async (job) => {
    const { campaignId, name, email } = job.data;
    console.log(`Sending win-back email to ${email}`);

    const { data, error } = await resend.emails.send({
      from: "Menoly <onboarding@resend.dev>",
      to: email,
      subject: "We miss you!",
      html: `<p>Hi ${name || "there"},</p><p>We noticed you haven't shopped with us in a while — here's 15% off to welcome you back.</p>`,
    });

    if (error) {
      await prisma.winbackCampaign.update({
        where: { id: campaignId },
        data: { status: "failed" },
      });
      throw new Error(error.message);
    }

    await prisma.winbackCampaign.update({
      where: { id: campaignId },
      data: { status: "sent", sentAt: new Date() },
    });

    console.log(`Email sent, id: ${data?.id}`);
  },
  { connection: { host: "localhost", port: 6379 } }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.log(`Job ${job?.id} failed: ${err.message}`));
