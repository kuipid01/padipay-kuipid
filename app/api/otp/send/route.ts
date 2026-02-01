import { NextResponse } from "next/server";
import { termii } from "@/lib/termii";
import { brevo } from "@/lib/brevo";

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; pinId?: string; expiresAt: Date }>();

export async function POST(request: Request) {
    try {
        const { type, value } = await request.json();

        if (!type || !value) {
            return NextResponse.json({ error: "Type and value are required" }, { status: 400 });
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
                const otp = termii.generateOTP(6);
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
                otpStore.set(key, { otp, expiresAt });
                
                console.log(`[FALLBACK] SMS OTP to ${value}: ${otp}`);
                
                return NextResponse.json({ 
                    success: true, 
                    message: `OTP sent to ${value}`,
                    devOtp: process.env.NODE_ENV === "development" ? otp : undefined
                });
            }

            // Store Termii pinId for verification
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            otpStore.set(key, { otp: "", pinId: result.pinId, expiresAt });

            return NextResponse.json({ 
                success: true, 
                message: `OTP sent to ${value}`,
                useTermii: true
            });

        } else if (type === "email") {
            // Use Brevo for Email OTP
            const otp = brevo.generateOTP(6);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            const result = await brevo.sendOTPEmail(value, otp);

            if (!result.success) {
                console.log(`[FALLBACK] Email OTP to ${value}: ${otp}`);
            }

            // Store OTP locally (Brevo doesn't manage OTP verification)
            otpStore.set(key, { otp, expiresAt });

            return NextResponse.json({ 
                success: true, 
                message: `OTP sent to ${value}`,
                devOtp: process.env.NODE_ENV === "development" ? otp : undefined
            });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (error: any) {
        console.error("OTP send error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Export for use in verify route
export { otpStore };
