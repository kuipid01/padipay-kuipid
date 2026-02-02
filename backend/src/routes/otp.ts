import { Hono } from "hono";
import { termii } from "../lib/termii";
import { brevo } from "../lib/brevo";

const otp = new Hono();

/**
 * In-memory OTP storage
 * NOTE: In production, use Redis or similar for shared state across instances
 */
const otpStore = new Map<string, { otp: string; pinId?: string; expiresAt: Date }>();

/**
 * OTP Routes
 * 
 * Original paths preserved:
 * - POST /api/otp/send   -> Send OTP via SMS or Email
 * - POST /api/otp/verify -> Verify OTP
 */

// POST /api/otp/send
otp.post("/send", async (c) => {
  const { type, value } = await c.req.json();

  if (!type || !value) {
    return c.json({ error: "Type and value are required" }, 400);
  }

  const key = `${type}:${value}`;

  if (type === "phone") {
    // Use Termii for SMS OTP
    const result = await termii.sendOTP({
      to: value,
      pinLength: 6,
      pinTimeToLive: 10, // 10 minutes
      pinAttempts: 3,
    });

    if (!result.success) {
      // Fallback to local OTP generation if Termii fails
      const otpCode = termii.generateOTP(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      otpStore.set(key, { otp: otpCode, expiresAt });

      console.log(`[FALLBACK] SMS OTP to ${value}: ${otpCode}`);

      return c.json({
        success: true,
        message: `OTP sent to ${value}`,
        devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    }

    // Store Termii pinId for verification
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    otpStore.set(key, { otp: "", pinId: result.pinId, expiresAt });

    return c.json({
      success: true,
      message: `OTP sent to ${value}`,
      useTermii: true,
    });
  } else if (type === "email") {
    // Use Brevo for Email OTP
    const otpCode = brevo.generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const result = await brevo.sendOTPEmail(value, otpCode);

    if (!result.success) {
      console.log(`[FALLBACK] Email OTP to ${value}: ${otpCode}`);
    }

    // Store OTP locally (Brevo doesn't manage OTP verification)
    otpStore.set(key, { otp: otpCode, expiresAt });

    return c.json({
      success: true,
      message: `OTP sent to ${value}`,
      devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  }

  return c.json({ error: "Invalid type" }, 400);
});

// POST /api/otp/verify
otp.post("/verify", async (c) => {
  const { type, value, otp: otpCode } = await c.req.json();

  if (!type || !value || !otpCode) {
    return c.json({ error: "Type, value, and OTP are required" }, 400);
  }

  const key = `${type}:${value}`;
  const stored = otpStore.get(key);

  if (!stored) {
    return c.json(
      { error: "OTP not found or expired. Please request a new one." },
      400
    );
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(key);
    return c.json(
      { error: "OTP has expired. Please request a new one." },
      400
    );
  }

  // For phone OTP, try Termii verification first if we have a pinId
  if (type === "phone" && stored.pinId) {
    const result = await termii.verifyOTP({
      pinId: stored.pinId,
      pin: otpCode,
    });

    if (!result.success || !result.verified) {
      return c.json(
        {
          error: result.error || "Invalid OTP. Please try again.",
          attemptsRemaining: result.attemptsRemaining,
        },
        400
      );
    }

    // OTP verified - remove from store
    otpStore.delete(key);

    return c.json({
      success: true,
      message: "Phone verified successfully",
      verified: true,
    });
  }

  // For email or fallback phone verification, check local store
  if (stored.otp !== otpCode) {
    return c.json({ error: "Invalid OTP. Please try again." }, 400);
  }

  // OTP verified successfully - remove from store
  otpStore.delete(key);

  return c.json({
    success: true,
    message: `${type === "phone" ? "Phone" : "Email"} verified successfully`,
    verified: true,
  });
});

export default otp;
