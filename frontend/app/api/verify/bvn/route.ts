import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const isTestSuite = process.env.SUITE === "test";

export async function POST(request: Request) {
  try {
    //  const cookieStore = await cookies();
    //     const token = cookieStore.get("token")?.value;

    //     if (!token) {
    //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //     }
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}${isTestSuite ? "/api/test/dojah/bvn" : "/api/verify/bvn"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const errorText = await response.text();
      console.error("Backend returned non-JSON response:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response?.status },
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response?.status });
    }

    const verifiedData = isTestSuite ? data.entity : data.data || data;

    return NextResponse.json({
      success: true,
      message: "BVN verified successfully",
      verified: true,
      data: {
        firstName: verifiedData?.first_name || verifiedData?.firstName,
        lastName: verifiedData?.last_name || verifiedData?.lastName,
        dateOfBirth: verifiedData?.date_of_birth || verifiedData?.dateOfBirth,
        gender: verifiedData?.gender,
        creditScore: data?.creditScore || data?.data?.creditScore,
        // Don't expose full phone in response for security
      },
    });
  } catch (error: any) {
    console.error("BVN verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
