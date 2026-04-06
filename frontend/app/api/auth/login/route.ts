import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Login failed" },
        { status: response.status }
      );
    }

    const { user, token } = data;

    const cookieStore = await cookies();
    
    // Secure token cookie (httpOnly)
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Client-readable user ID for React Query cache-busting
    cookieStore.set("uid", user.id, {
      httpOnly: false, // Must be false to be readable by useUser hook
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
