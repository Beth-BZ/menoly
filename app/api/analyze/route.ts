import { NextResponse } from "next/server";
import { runWinbackAnalysis } from "@/lib/rfm-core";

export async function POST() {
  const result = await runWinbackAnalysis();
  return NextResponse.json(result);
}
