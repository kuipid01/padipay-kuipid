import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET() {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Paystack key not configured" }, { status: 500 });
    }
console.log("we got here ")
    const response = await fetch(
      "https://api.paystack.co/bank?currency=NGN&perPage=100&use_cursor=false",
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "force-cache",
        next: { revalidate: 86400 }, // Cache for 24 hours — bank list rarely changes
      }
    );
console.log("we got here 2",response)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "Failed to fetch banks from Paystack" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Public banks proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
