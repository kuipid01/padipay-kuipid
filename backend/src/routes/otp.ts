import { Hono } from "hono";
import { termii } from "../lib/termii";
import { brevo } from "../lib/brevo";
import { redis } from "bun";
import { db } from "../db";

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

    console.log("[OTP SEND] Request received", {
      type,
      value,
      loanAppSlug,
    });

    if (!type || !value) {
      console.warn("[BLOCK] Missing type or value");
      return c.json({ error: "Type and value are required" }, 400);
    }

    if (!["phone", "email"].includes(type)) {
      console.warn("[BLOCK] Invalid type", type);
      return c.json({ error: "Invalid type" }, 400);
    }

    const key = `otp:${type}:${value}`;
    let bvnVerified = false;

    // -----------------------------
    // 1. Check borrower status
    // Permanent borrower = existing user, block OTP
    // Temp borrower = not an existing user, do not block OTP
    // -----------------------------
    console.log("[STEP 1] Checking borrower status");

    try {
      const { eq } = await import("drizzle-orm");
      const { db, borrowers, tempBorrowers } = await import("../db");

      let existingBorrower: any = null;
      let existingTempBorrower: any = null;

      if (type === "phone") {
        existingBorrower = await db.query.borrowers.findFirst({
          where: eq(borrowers.phone, value),
          with: { applications: true },
        });

        existingTempBorrower = await db.query.tempBorrowers.findFirst({
          where: eq(tempBorrowers.phoneNumber, value),
        });
      }

      if (type === "email") {
        existingBorrower = await db.query.borrowers.findFirst({
          where: eq(borrowers.email, value),
          with: { applications: true },
        });

        existingTempBorrower = await db.query.tempBorrowers.findFirst({
          where: eq(tempBorrowers.email, value),
        });
      }

      // -----------------------------
      // Permanent borrower exists
      // Do not send OTP
      // -----------------------------
      if (existingBorrower) {
        console.log("[INFO] Found existing permanent borrower", {
          borrowerId: existingBorrower.id,
          phone: existingBorrower.phone,
          email: existingBorrower.email,
          bvn: existingBorrower.bvn,
          kycVerified: existingBorrower.kycVerified,
          applicationsCount: existingBorrower.applications?.length ?? 0,
        });

        if (
          existingBorrower.bvn ||
          existingBorrower.kycVerified ||
          (existingBorrower.applications?.length ?? 0) > 0
        ) {
          bvnVerified = true;
        }

        return c.json(
          {
            success: false,
            code: "BORROWER_ALREADY_EXISTS",
            message:
              "We already have a borrower with these details. Please login to continue. If you are having issues accessing your account, please proceed to lay a complaint.",
            bvnVerified,
          },
          409
        );
      }

      // -----------------------------
      // Temp borrower exists
      // Do not block OTP
      // -----------------------------
      if (existingTempBorrower) {
        console.log("[INFO] Found temp borrower, but not blocking OTP", {
          tempBorrowerId: existingTempBorrower.id,
          phone: existingTempBorrower.phoneNumber,
          email: existingTempBorrower.email,
          bvn: existingTempBorrower.bvn,
          kycVerified: existingTempBorrower.kycVerified,
        });

        if (existingTempBorrower.bvn || existingTempBorrower.kycVerified) {
          bvnVerified = true;
        }
      }

      console.log("[INFO] No permanent borrower found. Proceeding with OTP.");
    } catch (error) {
      console.error("[ERROR] Checking borrower status:", error);

      return c.json(
        {
          success: false,
          error: "Unable to verify borrower status. Please try again.",
        },
        500
      );
    }

    console.log("[STEP 2] OTP Redis key", key);

    // -----------------------------
    // 2. Handle phone OTP
    // -----------------------------
    if (type === "phone") {
      console.log("[STEP 3] Sending phone OTP via Termii");

      const result = await termii.sendOTP({
        to: value,
        pinLength: 6,
        pinTimeToLive: 10,
        pinAttempts: 3,
      });

      if (!result.success) {
        const otpCode = termii.generateOTP(6);

        console.warn("[FALLBACK] Termii failed, using local OTP", {
          otpCode:
            process.env.NODE_ENV === "development" ? otpCode : "[hidden]",
        });

        await redis.set(key, JSON.stringify({ otp: otpCode }), "EX", 600);

        return c.json({
          success: true,
          message: `OTP sent to ${value}`,
          devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
          bvnVerified,
        });
      }

      console.log("[INFO] Termii OTP sent successfully", {
        pinId: result.pinId,
      });

      await redis.set(
        key,
        JSON.stringify({
          pinId: result.pinId,
        }),
        "EX",
        600
      );

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

      if (process.env.NODE_ENV === "development") {
        console.log("[DEV OTP]", otpCode);
      }

      if (!result.success) {
        console.warn("[FALLBACK] Email OTP send failed, storing OTP anyway");
      } else {
        console.log("[INFO] Email OTP sent successfully");
      }

      await redis.set(
        key,
        JSON.stringify({
          otp: otpCode,
        }),
        "EX",
        600
      );

      return c.json({
        success: true,
        message: `OTP sent to ${value}`,
        devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
        bvnVerified,
      });
    }

    return c.json({ error: "Invalid type" }, 400);
  } catch (error: any) {
    console.error("[ERROR] /otp/send", error);

    return c.json(
      {
        error: error?.message ?? "Something went wrong",
      },
      500
    );
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
