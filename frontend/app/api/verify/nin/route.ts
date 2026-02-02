import { NextResponse } from "next/server";
import { dojah } from "@/lib/dojah";

export async function POST(request: Request) {
    try {
        const { nin, phone } = await request.json();

        if (!nin || nin.length !== 11) {
            return NextResponse.json({ error: "Valid 11-digit NIN is required" }, { status: 400 });
        }

        // Use Dojah for NIN verification
        const result = await dojah.verifyNIN(nin);

        if (!result.success) {
            return NextResponse.json({ 
                error: result.error || "NIN verification failed" 
            }, { status: 400 });
        }

        // Optionally verify phone number matches NIN
        if (phone && result.data?.phone_number) {
            const normalizedPhone = phone.replace(/^\+234/, "0").replace(/\D/g, "");
            const ninPhone = result.data.phone_number.replace(/^\+234/, "0").replace(/\D/g, "");
            
            if (normalizedPhone !== ninPhone) {
                console.warn(`Phone mismatch: provided ${normalizedPhone}, NIN has ${ninPhone}`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "NIN verified successfully",
            verified: true,
            data: {
                firstName: result.data?.first_name,
                lastName: result.data?.last_name,
                dateOfBirth: result.data?.date_of_birth,
                gender: result.data?.gender,
                photo: result.data?.photo, // Can be used for face matching
            }
        });
    } catch (error: any) {
        console.error("NIN verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
