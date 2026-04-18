import { Hono } from "hono";
import { termii } from "../lib/termii";
import { brevo } from "../lib/brevo";
import { redis } from "bun";

const otp = new Hono();

/**
 * OTP Routes
 * 
 * Original paths preserved:
 * - POST /api/otp/send   -> Send OTP via SMS or Email
 * - POST /api/otp/verify -> Verify OTP
 */

// POST /api/otp/send
otp.post("/send", async (c) => {
  try {
    const { type, value, loanAppSlug } = await c.req.json();
    console.log("[OTP SEND] Request received", { type, value, loanAppSlug });

    if (!type || !value) {
      console.warn("[BLOCK] Missing type or value");
      return c.json({ error: "Type and value are required" }, 400);
    }

    // -----------------------------
    // 1. Check if user exists & BVN verified
    // -----------------------------
    let bvnVerified = false;

    if (type === "phone" && loanAppSlug) {
      console.log("[STEP 1] Checking existing user status");

      try {
        const { eq } = await import("drizzle-orm");
        const { db, borrowers, tempBorrowers } = await import("../db");

        let creditScore: any = null;

        // Check permanent borrowers
        const existingBorrower = await db.query.borrowers.findFirst({
          where: eq(borrowers.phone, value),
          with: { applications: true },
        });

        if (existingBorrower) {
          console.log("[INFO] Found permanent borrower", {
            borrowerId: existingBorrower.id,
            bvn: existingBorrower.bvn,
            kycVerified: existingBorrower.kycVerified,
            applicationsCount: existingBorrower.applications.length,
          });

          if (
            (existingBorrower.bvn || existingBorrower.kycVerified) &&
            existingBorrower.applications.length > 0
          ) {
            bvnVerified = true;
            console.log("[INFO] Borrower BVN verified + has applications");
          }
        } else {
          // Check temp borrowers
          const existingTemp = await db.query.tempBorrowers.findFirst({
            where: eq(tempBorrowers.phoneNumber, value),
          });

          if (existingTemp) {
            console.log("[INFO] Found temp borrower", {
              tempBorrowerId: existingTemp.id,
              bvn: existingTemp.bvn,
              kycVerified: existingTemp.kycVerified,
            });

            if (existingTemp.bvn || existingTemp.kycVerified) {
              bvnVerified = true;
              console.log("[INFO] Temp borrower BVN verified");
            }
          } else {
            console.log("[INFO] No borrower found");
          }
        }
      } catch (error) {
        console.error("[ERROR] Checking existing user status:", error);
      }
    }

    const key = `otp:${type}:${value}`;
    console.log("[STEP 2] OTP Redis key", key);

    // -----------------------------
    // 2. Handle phone OTP
    // -----------------------------
    if (type === "phone") {
      console.log("[STEP 3] Sending phone OTP via Termii");
      const result = await termii.sendOTP({
        to: value,
        pinLength: 6,
        pinTimeToLive: 10, // minutes
        pinAttempts: 3,
      });

      if (!result.success) {
        // Fallback to local OTP
        const otpCode = termii.generateOTP(6);
        console.warn(`[FALLBACK] Termii failed, local OTP: ${otpCode}`);

        await redis.set(key, JSON.stringify({ otp: otpCode }), "EX", 600);

        return c.json({
          success: true,
          message: `OTP sent to ${value}`,
          devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
          bvnVerified,
        });
      }

      console.log("[INFO] Termii OTP sent successfully", { pinId: result.pinId });

      // Store Termii pinId in Redis
      await redis.set(key, JSON.stringify({ pinId: result.pinId }), "EX", 600);

      return c.json({
        success: true,
        message: `OTP sent to ${value}`,
        useTermii: true,
        bvnVerified,
      });
    }

    // -----------------------------
    // 3. Handle email OTP
    // -----------------------------
    if (type === "email") {
      console.log("[STEP 3] Sending email OTP via Brevo");
      const otpCode = brevo.generateOTP(6);
      const result = await brevo.sendOTPEmail(value, otpCode);
      console.log(otpCode, "FOR TEST")
      if (!result.success) {
        console.warn(`[FALLBACK] Email OTP send failed, OTP: ${otpCode}`);
      } else {
        console.log("[INFO] Email OTP sent successfully");
      }

      await redis.set(key, JSON.stringify({ otp: otpCode }), "EX", 600);

      return c.json({
        success: true,
        message: `OTP sent to ${value}`,
        devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    }

    console.warn("[BLOCK] Invalid type", type);
    return c.json({ error: "Invalid type" }, 400);
  } catch (error: any) {
    console.error("[ERROR] /otp/send", error);
    return c.json({ error: error?.message ?? "Something went wrong" }, 500);
  }
});


// POST /api/otp/verify
otp.post("/verify", async (c) => {
  const { type, value, otp: otpCode } = await c.req.json();

  if (!type || !value || !otpCode) {
    return c.json({ error: "Type, value, and OTP are required" }, 400);
  }

  const key = `otp:${type}:${value}`;
  const storedStr = await redis.get(key);

  if (!storedStr) {
    return c.json(
      { error: "OTP not found or expired. Please request a new one." },
      400
    );
  }

  const stored = JSON.parse(storedStr);
  let isVerified = false;

  // For phone OTP with Termii pinId
  if (type === "phone" && stored.pinId) {
    const result = await termii.verifyOTP({
      pinId: stored.pinId,
      pin: otpCode,
    });

    if (result.success && result.verified) {
      isVerified = true;
    } else {
      return c.json(
        {
          error: result.error || "Invalid OTP. Please try again.",
          attemptsRemaining: result.attemptsRemaining,
        },
        400
      );
    }
  } else {
    // For email or fallback phone verification, check Redis store
    if (stored.otp === otpCode) {
      isVerified = true;
    } else {
      return c.json({ error: "Invalid OTP. Please try again." }, 400);
    }
  }

  if (isVerified) {
    // OTP verified - remove from Redis
    await redis.del(key);

    // Update or create temp borrower record
    try {
      const { eq } = await import("drizzle-orm");
      const { db, tempBorrowers } = await import("../db");

      if (type === "phone") {
        const existing = await db.query.tempBorrowers.findFirst({
          where: eq(tempBorrowers.phoneNumber, value),
        });

        if (existing) {
          await db.update(tempBorrowers)
            .set({ phoneNumberVerified: true, updatedAt: new Date() })
            .where(eq(tempBorrowers.id, existing.id));
        } else {
          await db.insert(tempBorrowers).values({
            phoneNumber: value,
            phoneNumberVerified: true,
          });
        }
      }
    } catch (dbError) {
      console.error("Database error while updating temp borrower:", dbError);
    }

    return c.json({
      success: true,
      message: `${type === "phone" ? "Phone" : "Email"} verified successfully`,
      verified: true,
    });
  }

  return c.json({ error: "Verification failed" }, 400);
});

export default otp;
