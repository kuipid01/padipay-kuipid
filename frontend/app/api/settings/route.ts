import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phone, paystackPublicKey, paystackSecretKey } = await req.json();

    const [updatedUser] = await db.update(users)
      .set({
        fullName,
        phone,
        paystackPublicKey,
        paystackSecretKey,
      })
      .where(eq(users.id, session.id as string))
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
