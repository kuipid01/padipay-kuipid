
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function proxyRequest(req: NextRequest, method: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const body = method !== "GET" ? await req.json() : undefined;

    const res = await fetch(`${backendUrl}/api/loan-preference`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      console.error("Backend error:", text);
      return NextResponse.json(
        { error: "Internal backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(data,"data")
    return NextResponse.json(data, { status: res.status });

  } catch (error: any) {
    console.error(`Settings ${method} proxy error:`, error);
    return NextResponse.json(
      { error: error.message || "Request failed" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
    return proxyRequest(req, "GET");
}

export async function PATCH(req: NextRequest) {
    return proxyRequest(req, "PATCH");
}
export async function POST(req: NextRequest) {
    return proxyRequest(req, "POST");
}
export async function DELETE(req: NextRequest) {
    return proxyRequest(req, "DELETE");
}