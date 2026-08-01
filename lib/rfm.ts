import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface CustomerScore {
  customerId: string;
  name: string | null;
  email: string;
  recencyDays: number;
  frequency: number;
  monetary: number;
  needsWinback: boolean;
}

async function calculateRFM(): Promise<CustomerScore[]> {
  const customers = await prisma.customer.findMany({
    include: { orders: true },
  });

  const scores: CustomerScore[] = customers.map((customer) => {
    const orders = customer.orders;

    if (orders.length === 0) {
      return {
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        recencyDays: Infinity,
        frequency: 0,
        monetary: 0,
        needsWinback: false,
      };
    }

    const mostRecentOrder = orders.reduce((latest, order) =>
      order.createdAt > latest.createdAt ? order : latest
    );

    const recencyDays = Math.floor(
      (Date.now() - mostRecentOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const frequency = orders.length;
    const monetary = orders.reduce((sum, o) => sum + o.amount, 0);

    const wasValuable = frequency >= 3 || monetary >= 100;
    const hasGoneQuiet = recencyDays >= 30;
    const needsWinback = wasValuable && hasGoneQuiet;

    return {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      recencyDays,
      frequency,
      monetary,
      needsWinback,
    };
  });

  return scores;
}

async function main() {
  const scores = await calculateRFM();

  console.table(
    scores.map((s) => ({
      name: s.name,
      recency: `${s.recencyDays}d`,
      frequency: s.frequency,
      monetary: `$${s.monetary}`,
      needsWinback: s.needsWinback ? "⚠️ YES" : "no",
    }))
  );
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

