import { db } from "@/db";
import { newsletters } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        await db.insert(newsletters).values({ email }).onConflictDoNothing();

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Newsletter error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
