import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        // Using borrower_token as per the project's borrower proxy convention
        const token = cookieStore.get("borrower_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const documentType = formData.get("type") as string;
        const name = formData.get("name") as string;

        if (!file || !documentType) {
            return NextResponse.json(
                { error: "Missing file or document type" },
                { status: 400 }
            );
        }

        // 1. Get Cloudinary signature from the backend
        // Note: Calling the internal backend signing endpoint
        const signRes = await fetch(`${BACKEND_URL}/api/borrower-upload/sign`, {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        });
console.log(signRes,"res")
        if (!signRes.ok) {
            const errorData = await signRes.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to get upload signature from backend");
        }

        const signData = await signRes.json();

        // 2. Upload the file directly to Cloudinary
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", file);
        cloudinaryFormData.append("api_key", signData.apiKey);
        cloudinaryFormData.append("timestamp", signData.timestamp.toString());
        cloudinaryFormData.append("signature", signData.signature);
        cloudinaryFormData.append("folder", signData.folder);

        const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
            {
                method: "POST",
                body: cloudinaryFormData,
            }
        );

        if (!uploadRes.ok) {
            const errorData = await uploadRes.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const uploadData = await uploadRes.json();

        // 3. Pass the Cloudinary data to the backend to save the document
        const saveRes = await fetch(`${BACKEND_URL}/api/borrower/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                documentType: documentType,
                url: uploadData.secure_url,
                publicId: uploadData.public_id,
                name: name || file.name,
            }),
        });

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
            return NextResponse.json(
                { error: saveData.error || "Failed to save document record on backend" },
                { status: saveRes.status }
            );
        }

        return NextResponse.json(saveData);

    } catch (error: any) {
        console.error("Document upload orchestration error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error during upload" },
            { status: 500 }
        );
    }
}