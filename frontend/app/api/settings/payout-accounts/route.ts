
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
        const body = await req.json();

        const res = await fetch(`${backendUrl}/api/settings/payout-accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error("Payout Account POST proxy error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
