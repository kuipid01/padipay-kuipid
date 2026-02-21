import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, passcode } = body;

    if (!identifier || !passcode) {
      return NextResponse.json(
        { error: "Phone number and passcode are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/borrower/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, passcode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Login failed" },
        { status: response.status }
      );
    }

    const { token, borrower } = data;

    // Set a separate borrower_token cookie (distinct from the admin 'token' cookie)
    const cookieStore = await cookies();
    cookieStore.set("borrower_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ status: "success", borrower });
  } catch (error) {
    console.error("Borrower login proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
