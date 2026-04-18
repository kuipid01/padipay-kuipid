import { db } from "@/db";
import { newsletters } from "@/db/schema";
import { NextResponse } from "next/server";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        const response = await fetch(
            `${BACKEND_URL}/api/newsletter`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            }
        );
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log(errorData)
            return NextResponse.json(errorData, { status: response.status });
        }
        return NextResponse.json({ message: "Subscribed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Newsletter error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
