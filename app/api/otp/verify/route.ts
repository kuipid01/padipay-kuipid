import { NextResponse } from "next/server";
import { termii } from "@/lib/termii";

// In-memory OTP storage (shared with send route - in production use Redis)
const otpStore = new Map<string, { otp: string; pinId?: string; expiresAt: Date }>();

export async function POST(request: Request) {
    try {
        const { type, value, otp } = await request.json();

        if (!type || !value || !otp) {
            return NextResponse.json({ error: "Type, value, and OTP are required" }, { status: 400 });
        }

        const key = `${type}:${value}`;
        const stored = otpStore.get(key);

        if (!stored) {
            return NextResponse.json({ error: "OTP not found or expired. Please request a new one." }, { status: 400 });
        }

        if (new Date() > stored.expiresAt) {
            otpStore.delete(key);
            return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        // For phone OTP, try Termii verification first if we have a pinId
        if (type === "phone" && stored.pinId) {
            const result = await termii.verifyOTP({
                pinId: stored.pinId,
                pin: otp,
            });

            if (!result.success || !result.verified) {
                return NextResponse.json({ 
                    error: result.error || "Invalid OTP. Please try again.",
                    attemptsRemaining: result.attemptsRemaining
                }, { status: 400 });
            }

            // OTP verified - remove from store
            otpStore.delete(key);

            return NextResponse.json({ 
                success: true, 
                message: "Phone verified successfully",
                verified: true
            });
        }

        // For email or fallback phone verification, check local store
        if (stored.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
        }

        // OTP verified successfully - remove from store
        otpStore.delete(key);

        return NextResponse.json({ 
            success: true, 
            message: `${type === "phone" ? "Phone" : "Email"} verified successfully`,
            verified: true
        });
    } catch (error: any) {
        console.error("OTP verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
