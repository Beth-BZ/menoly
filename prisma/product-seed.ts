import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = [
    { name: "Wireless Earbuds", stock: 3, lowStockAt: 5, price: 49 },
    { name: "Phone Case", stock: 120, lowStockAt: 20, price: 15 },
    { name: "Laptop Stand", stock: 2, lowStockAt: 10, price: 35 },
    { name: "USB-C Cable", stock: 200, lowStockAt: 30, price: 9 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }

  const orders = await prisma.order.findMany();

  for (const order of orders) {
    const numItems = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numItems; i++) {
      const product =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      });
    }
  }

  console.log("Product seed complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = [
    { name: "Wireless Earbuds", stock: 3, lowStockAt: 5, price: 49 },
    { name: "Phone Case", stock: 120, lowStockAt: 20, price: 15 },
    { name: "Laptop Stand", stock: 2, lowStockAt: 10, price: 35 },
    { name: "USB-C Cable", stock: 200, lowStockAt: 30, price: 9 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    createdProducts.push(product);
  }

  const orders = await prisma.order.findMany();

  for (const order of orders) {
    const numItems = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numItems; i++) {
      const product =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      });
    }
  }

  console.log("Product seed complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
