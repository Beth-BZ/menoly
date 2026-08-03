import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { winbackQueue } from "./queue/winback-queue";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export async function calculateRFM() {
  const customers = await prisma.customer.findMany({ include: { orders: true } });

  return customers.map((customer) => {
    const orders = customer.orders;
    if (orders.length === 0) {
      return { customerId: customer.id, name: customer.name, email: customer.email, recencyDays: Infinity, frequency: 0, monetary: 0, needsWinback: false };
    }
    const mostRecentOrder = orders.reduce((latest, o) => (o.createdAt > latest.createdAt ? o : latest));
    const recencyDays = Math.floor((Date.now() - mostRecentOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const frequency = orders.length;
    const monetary = orders.reduce((sum, o) => sum + o.amount, 0);
    const needsWinback = (frequency >= 3 || monetary >= 100) && recencyDays >= 30;
    return { customerId: customer.id, name: customer.name, email: customer.email, recencyDays, frequency, monetary, needsWinback };
  });
}

export async function runWinbackAnalysis() {
  const scores = await calculateRFM();
  const flagged = scores.filter((s) => s.needsWinback);
  let created = 0;

  for (const customer of flagged) {
    const existing = await prisma.winbackCampaign.findFirst({
      where: { customerId: customer.customerId, status: "pending" },
    });
    if (!existing) {
      const campaign = await prisma.winbackCampaign.create({ data: { customerId: customer.customerId } });
      await winbackQueue.add("send-winback-email", {
        campaignId: campaign.id,
        customerId: customer.customerId,
        email: customer.email,
        name: customer.name,
      });
      created++;
    }
  }

  return { totalCustomers: scores.length, flaggedCount: flagged.length, campaignsCreated: created };
}
