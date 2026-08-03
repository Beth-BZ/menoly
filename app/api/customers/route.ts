import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { orders: true, campaigns: true },
  });

  const data = customers.map((customer) => {
    const orders = customer.orders;
    const frequency = orders.length;
    const monetary = orders.reduce((sum, o) => sum + o.amount, 0);

    const recencyDays =
      orders.length === 0
        ? null
        : Math.floor(
            (Date.now() -
              Math.max(...orders.map((o) => o.createdAt.getTime()))) /
              (1000 * 60 * 60 * 24)
          );

    const latestCampaign = customer.campaigns[customer.campaigns.length - 1];

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      recencyDays,
      frequency,
      monetary,
      campaignStatus: latestCampaign?.status ?? "none",
    };
  });

  return NextResponse.json(data);
}
