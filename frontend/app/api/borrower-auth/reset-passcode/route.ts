import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, passcode } = body;

    if (!token || !passcode) {
      return NextResponse.json(
        { error: "Reset token and new passcode are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/borrower/auth/reset-passcode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, passcode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to reset passcode" },
        { status: response.status }
      );
    }

    return NextResponse.json({ status: "success", message: data.message });
  } catch (error) {
    console.error("Borrower reset-passcode proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
