import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, defaultInterestRate, defaultDurationMonths, slug } = await req.json();

    if (!name || !defaultInterestRate || !defaultDurationMonths || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness
    const existingSlug = await db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
    });

    if (existingSlug) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    const [loanApp] = await db.insert(loanApps).values({
      ownerId: session.id as string,
      name,
      slug,
      defaultInterestRate: defaultInterestRate.toString(), // Drizzle decimal needs string or number
      defaultDurationMonths,
    }).returning();

    return NextResponse.json({ loanApp });
  } catch (error) {
    console.error("Create loan app error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apps = await db.query.loanApps.findMany({
      where: eq(loanApps.ownerId, session.id as string),
    });

    return NextResponse.json({ loanApps: apps });
  } catch (error) {
    console.error("Get loan apps error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
