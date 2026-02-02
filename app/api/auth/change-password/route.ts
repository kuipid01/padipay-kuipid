import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Map frontend 'currentPassword' to backend 'oldPassword'
    const backendBody = {
      oldPassword: body.currentPassword,
      newPassword: body.newPassword,
    };

    const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(backendBody),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json(
            { error: data.error || "Failed to change password" }, 
            { status: response.status }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Change password proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
