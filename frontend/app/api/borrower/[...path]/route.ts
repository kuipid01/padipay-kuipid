import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function proxyRequest(req: Request, path: string[], method: string) {
  try {

   
    const cookieStore = await cookies();
    // Borrower proxy uses the borrower_token cookie (separate from admin token)
    const token = cookieStore.get("borrower_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Capture search params from the original request
    const { search } = new URL(req.url);
    
    // Construct backend URL with /borrower suffix
    // Example: /api/borrower/loans -> BACKEND_URL/api/loans/borrower
    const backendPath = `borrower/${path.join("/")}`;

    const url = `${BACKEND_URL}/api/${backendPath}${search}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let body = undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        body = await req.json();
      } catch (e) {
        // Body might be empty
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
   
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Failed to ${method} ${backendPath}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Borrower API Proxy Error (${method}):`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return proxyRequest(req, path, "GET");
}

export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return proxyRequest(req, path, "POST");
}

export async function PATCH(req: Request, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return proxyRequest(req, path, "PATCH");
}

export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  const { path } = await params;
  return proxyRequest(req, path, "DELETE");
}
