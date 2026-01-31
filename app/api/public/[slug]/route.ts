import { NextResponse } from "next/server";
import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const loanApp = await db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
    });

    if (!loanApp) {
      return NextResponse.json({ error: "Loan app not found" }, { status: 404 });
    }

    if (!loanApp.isActive) {
        return NextResponse.json({ error: "Loan app is not active" }, { status: 404 });
    }

    return NextResponse.json({ loanApp });
  } catch (error) {
    console.error("Get public loan app error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
