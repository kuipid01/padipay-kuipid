import { NextResponse } from "next/server";
import { dojah } from "@/lib/dojah";

export async function POST(request: Request) {
    try {
        const { bvn, phone } = await request.json();

        if (!bvn || bvn.length !== 11) {
            return NextResponse.json({ error: "Valid 11-digit BVN is required" }, { status: 400 });
        }

        // Use Dojah for BVN verification
        const result = await dojah.verifyBVN(bvn);

        if (!result.success) {
            return NextResponse.json({ 
                error: result.error || "BVN verification failed" 
            }, { status: 400 });
        }

        // Optionally verify phone number matches BVN
        if (phone && result.data?.phone_number) {
            const normalizedPhone = phone.replace(/^\+234/, "0").replace(/\D/g, "");
            const bvnPhone = result.data.phone_number.replace(/^\+234/, "0").replace(/\D/g, "");
            
            if (normalizedPhone !== bvnPhone) {
                console.warn(`Phone mismatch: provided ${normalizedPhone}, BVN has ${bvnPhone}`);
                // You can decide whether to reject or just log this
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "BVN verified successfully",
            verified: true,
            data: {
                firstName: result.data?.first_name,
                lastName: result.data?.last_name,
                dateOfBirth: result.data?.date_of_birth,
                gender: result.data?.gender,
                // Don't expose full phone in response for security
            }
        });
    } catch (error: any) {
        console.error("BVN verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
