import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { borrowers, loanApplications, loanApps } from "../db/schema";

export interface Props {
  bvn: string;
  phone: string;
  email: string;
  slug: string;
}

export async function verifyAuthenticity({
  bvn,
  email,
  phone,
  slug,
}: Props) {

  // 1️⃣ Get loan app by slug
  const loanApp = await db.query.loanApps.findFirst({
    where: eq(loanApps.slug, slug),
  });

  if (!loanApp) {
    return {
      valid: false,
      reason: "Loan application not found",
    };
  }

  // 2️⃣ Find borrower with this BVN
  const borrower = await db.query.borrowers.findFirst({
    where: eq(borrowers.bvn, bvn),
  });

  // If borrower does not exist yet → safe
  if (!borrower) {
    return { valid: true };
  }

  // 3️⃣ Check if borrower already applied to this loan app
  const existingApplication = await db.query.loanApplications.findFirst({
    where: and(
      eq(loanApplications.borrowerId, borrower.id),
      eq(loanApplications.loanAppId, loanApp.id)
    ),
  });

  // If they never applied here before → allow
  if (!existingApplication) {
    return { valid: true };
  }

  // 4️⃣ Check if identity details match
  const emailMatches = borrower.email === email;
  const phoneMatches = borrower.phone === phone;

  if (!emailMatches || !phoneMatches) {
    return {
      valid: false,
      reason:
        "BVN already used on this loan app with different identity details",
    };
  }

  return { valid: true };
}