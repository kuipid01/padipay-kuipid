import { NextResponse } from "next/server";
import { db } from "@/db";
import { borrowers, loanApplications, loanApps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Handle both JSON and FormData
    const contentType = req.headers.get("content-type") || "";
    let formData: Record<string, any> = {};
    
    if (contentType.includes("multipart/form-data")) {
      const data = await req.formData();
      data.forEach((value, key) => {
        if (value instanceof File) {
          formData[key] = value;
        } else {
          formData[key] = value;
        }
      });
    } else {
      formData = await req.json();
    }

    const {
      fullName,
      email,
      phone,
      amount,
      duration,
      dateOfBirth,
      address,
      city,
      state,
      // Guarantor
      guarantorName,
      guarantorPhone,
      guarantorEmail,
      guarantorRelationship,
      guarantorAddress,
      // Verification
      bvn,
      nin,
      // Documents (Files)
      idDocument,
      proofOfAddress,
      bankStatement,
    } = formData;

    // 1. Fetch the loan app
    const loanApp = await db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
    });

    if (!loanApp || !loanApp.isActive) {
      return NextResponse.json({ error: "Loan app not found or inactive" }, { status: 404 });
    }

    // 2. Create or find borrower
    let borrower = await db.query.borrowers.findFirst({
      where: eq(borrowers.email, email),
    });

    if (!borrower) {
      const [newBorrower] = await db.insert(borrowers).values({
        fullName,
        email,
        phone,
        bvn: bvn || null,
        nin: nin || null,
      }).returning();
      borrower = newBorrower;
    } else {
      // Update existing borrower with new info
      await db.update(borrowers)
        .set({
          fullName,
          phone,
          bvn: bvn || borrower.bvn,
          nin: nin || borrower.nin,
        })
        .where(eq(borrowers.id, borrower.id));
    }

    // 3. Handle document uploads (in production, upload to S3/Cloudinary)
    let documentUrls: Record<string, string> = {};
    
    if (idDocument instanceof File) {
      // TODO: Upload to cloud storage
      console.log(`[DEV] ID Document: ${idDocument.name} (${idDocument.size} bytes)`);
      documentUrls.idDocument = `uploads/${idDocument.name}`;
    }
    if (proofOfAddress instanceof File) {
      console.log(`[DEV] Proof of Address: ${proofOfAddress.name} (${proofOfAddress.size} bytes)`);
      documentUrls.proofOfAddress = `uploads/${proofOfAddress.name}`;
    }
    if (bankStatement instanceof File) {
      console.log(`[DEV] Bank Statement: ${bankStatement.name} (${bankStatement.size} bytes)`);
      documentUrls.bankStatement = `uploads/${bankStatement.name}`;
    }

    // 4. Create Loan Application
    const [application] = await db.insert(loanApplications).values({
      loanAppId: loanApp.id,
      borrowerId: borrower.id,
      amount: amount.toString(),
      durationMonths: parseInt(duration || formData.durationMonths),
      interestRate: loanApp.defaultInterestRate,
      status: "PENDING",
    }).returning();

    // 5. Store additional application data (guarantor, documents)
    // In production, create separate tables for guarantors and documents
    console.log("[DEV] Application metadata:", {
      applicationId: application.id,
      guarantor: {
        name: guarantorName,
        phone: guarantorPhone,
        email: guarantorEmail,
        relationship: guarantorRelationship,
        address: guarantorAddress,
      },
      applicantDetails: {
        dateOfBirth,
        address,
        city,
        state,
      },
      documents: documentUrls,
    });

    // 6. Initialize Paystack Transaction for Card Authorization
    const paystackSession = await initializeTransaction(email, 100, {
      applicationId: application.id,
      borrowerId: borrower.id,
      type: "CARD_AUTHORIZATION",
    });

    if (!paystackSession.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      application,
      authorizationUrl: paystackSession.data.authorization_url,
      reference: paystackSession.data.reference,
    });
  } catch (error) {
    console.error("Public apply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

