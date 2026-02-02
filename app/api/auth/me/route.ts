import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Important to prevent caching for auth status
      cache: "no-store", 
    });

    if (!response.ok) {
        // If token invalid/expired, remove cookie
        if (response.status === 401) {
            cookieStore.delete("token");
        }
        return NextResponse.json({ user: null });
    }

    const data = await response.json();
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error("Auth me proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
