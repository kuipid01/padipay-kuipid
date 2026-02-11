"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BorrowerAuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    // If the user is already authenticated as a borrower, redirect to borrower dashboard
                    // For now, we'll just redirect to dashboard as requested
                    router.push("/borrower/dashboard");
                }
            } catch (error) {
                console.log("Not authenticated");
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {children}
        </div>
    );
}
