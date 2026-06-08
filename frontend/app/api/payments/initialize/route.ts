import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,

) {
  try {
    const { type, callback, callbackUrl, borrowerEmail, loanAppSlug, amount, ...rest } = await req.json();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const isTestSuite = process.env.SUITE === "test";

    // Reconstruct the payload for the main backend
    const payload = {
      email: decodeURIComponent(borrowerEmail),
      amount: parseFloat(amount),
      metadata: {
        type,
        callback,
        callbackUrl,
        borrowerEmail,
        loanAppSlug,
        ...rest
      },
    };

    const res = await fetch(`${backendUrl}${isTestSuite ? "/api/test/paystack/initialize" : "/api/payments/initialize"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      console.error("Backend error (Payments Initialize):", text);
      return NextResponse.json(
        { error: "Internal backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error: any) {
    console.error("Payments initialization proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Request failed" },
      { status: 500 }
    );
  }
}
