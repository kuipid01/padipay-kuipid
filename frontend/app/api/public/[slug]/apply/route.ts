
import { NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const expectedBodySchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long"),
  durationMonths: z.coerce.number().positive("Duration must be greater than 0"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  repaymentPlanId: z.string().min(1, "Plan is required"),
  loanAppId: z.string().min(1, "Loan app is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const durationMonths =
      body.durationMonths ??
      (body.durationDays
        ? Math.ceil(Number(body.durationDays) / 30)
        : body.duration);

    const mappedBody = {
      email: body.email,
      phoneNumber: body.phone ?? body.phoneNumber,
      durationMonths,
      amount: body.amount,
      repaymentPlanId: body.planId ?? body.repaymentPlanId,
      loanAppId: slug,
    };

    const parsed = expectedBodySchema.safeParse(mappedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/public/application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const errorText = await response.text();
      console.error("Backend returned non-JSON response:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${errorText.slice(0, 100)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to submit application" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Public apply proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
