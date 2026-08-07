import { NextResponse } from "next/server";
import { getLowStockProducts, getBestSellers } from "@/lib/inventory-core";

export async function GET() {
  const [lowStock, bestSellers] = await Promise.all([
    getLowStockProducts(),
    getBestSellers(),
  ]);
  return NextResponse.json({ lowStock, bestSellers });
}
