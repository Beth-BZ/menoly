import { prisma } from "./rfm-core";

export async function getLowStockProducts() {
  const products = await prisma.product.findMany();
  return products.filter((p) => p.stock <= p.lowStockAt);
}

export async function getBestSellers() {
  const items = await prisma.orderItem.findMany({ include: { product: true } });

  const totals = new Map<string, { name: string; quantitySold: number }>();

  for (const item of items) {
    const existing = totals.get(item.productId);
    if (existing) {
      existing.quantitySold += item.quantity;
    } else {
      totals.set(item.productId, {
        name: item.product.name,
        quantitySold: item.quantity,
      });
    }
  }

  return Array.from(totals.values()).sort(
    (a, b) => b.quantitySold - a.quantitySold
  );
}
