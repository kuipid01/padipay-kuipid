import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentMethods, loanApplications } from "@/db/schema";
import { verifyTransaction } from "@/lib/paystack";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/status?error=no_reference`);
  }

  try {
    const data = await verifyTransaction(reference);

    if (data.status && data.data.status === "success") {
      const { metadata, authorization } = data.data;
      const { applicationId, borrowerId } = metadata;

      // Store authorization for future charges
      await db.insert(paymentMethods).values({
        borrowerId,
        provider: "PAYSTACK",
        authorizationCode: authorization.authorization_code,
        last4: authorization.last4,
        expiry: `${authorization.exp_month}/${authorization.exp_year}`,
      });

      // Optionally update loan application if needed
      // Logic: If this was for a specific application, we might mark it as "Card Added"
      
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/loan/success?ref=${reference}`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/loan/error?ref=${reference}`);
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/loan/error`);
  }
}
