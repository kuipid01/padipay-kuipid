import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// Types for the backend response
interface Loan {
  id: string;
  applicationId: string;
  lenderId: string;
  borrowerId: string;
  principal: string;
  interest: string;
  totalPayable: string;
  status: "ACTIVE" | "COMPLETED" | "DEFAULTED";
  startDate: string;
}

interface Repayment {
  id: string;
  loanId: string;
  amount: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "FAILED";
}

interface ApproveResponse {
  loan: Loan;
  repayments: Repayment[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call backend to approve the application
    // The backend is expected to handle totals calculation, loan creation,
    // repayment generation, and application status update.
    const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}/approve`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to approve loan" },
        { status: response.status }
      );
    }

    return NextResponse.json(data as ApproveResponse);
  } catch (error) {
    console.error("Approve loan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
