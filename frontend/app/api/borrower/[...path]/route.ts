import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function proxyRequest(req: Request, path: string[], method: string) {
  try {

   console.log("GOT HERE PROXY")
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
    let url
if(backendPath.includes("documents")){
  url=`${BACKEND_URL}/api/lender/${backendPath}${search}`;
}
    else{url = `${BACKEND_URL}/api/${backendPath}${search}`};

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const contentType = req.headers.get("content-type");
    let body: any = undefined;

    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (contentType?.includes("application/json")) {
        try {
          const jsonBody = await req.json();
          body = JSON.stringify(jsonBody);
        } catch (e) {
          // Body might be empty
        }
      } else if (contentType?.includes("multipart/form-data")) {
        body = await req.formData();
        // Remove Content-Type header so fetch can set it correctly with the boundary
        delete headers["Content-Type"];
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
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

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(req, path, "GET");
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(req, path, "POST");
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(req, path, "PUT");
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(req, path, "PATCH");
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(req, path, "DELETE");
}
