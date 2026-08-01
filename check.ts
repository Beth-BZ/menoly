import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

prisma.winbackCampaign
  .findMany({ include: { customer: true } })
  .then((rows) => console.log(rows))
  .finally(() => prisma.$disconnect());
