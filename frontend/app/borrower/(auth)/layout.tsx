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
                const res = await fetch("/api/borrower-auth/me");
                if (res.ok) {
                    // Borrower is already authenticated, redirect to dashboard
                    router.push("/borrower/dashboard");
                }
            } catch (error) {
                // Not authenticated — stay on auth page
                console.log("Borrower not authenticated");
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
