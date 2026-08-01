import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const customers = [
    { email: "loyal@example.com", name: "Loyal Larry", daysAgoList: [2, 10, 20, 35] },
    { email: "churned@example.com", name: "Churned Chris", daysAgoList: [90, 100, 110] },
    { email: "new@example.com", name: "New Nancy", daysAgoList: [3] },
    { email: "atrisk@example.com", name: "At-Risk Amy", daysAgoList: [45, 60, 80] },
  ];

  for (const c of customers) {
    const customer = await prisma.customer.create({
      data: { email: c.email, name: c.name },
    });

    for (const daysAgo of c.daysAgoList) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      await prisma.order.create({
        data: {
          amount: Math.floor(Math.random() * 100) + 20,
          createdAt: date,
          customerId: customer.id,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

