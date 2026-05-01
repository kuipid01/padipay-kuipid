import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, bvn, phone } = body;

    if (!email || !bvn || !phone) {
      return NextResponse.json(
        { error: "Email, BVN, and phone are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/verify/refresh-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, bvn, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Refresh score proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
