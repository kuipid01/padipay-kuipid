import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const isTestSuite = process.env.SUITE === "test";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("borrower_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get("account_number");
    const bankCode = searchParams.get("bank_code");

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "account_number and bank_code are required" },
        { status: 400 }
      );
    }

    if (isTestSuite) {
      return NextResponse.json({
        status: true,
        message: "Account number resolved",
        data: {
          account_number: accountNumber,
          account_name: "SUITE TEST USER",
          bank_code: bankCode,
          bank_name: bankCode === "058" ? "Guaranty Trust Bank" : "Access Bank",
        },
      });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Paystack key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Could not resolve account number" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Account resolve proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
