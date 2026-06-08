import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const isTestSuite = process.env.SUITE === "test";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}${isTestSuite ? "/api/test/otp/send" : "/api/otp/send"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("OTP send proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
