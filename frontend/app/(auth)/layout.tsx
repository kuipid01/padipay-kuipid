"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    // User is authenticated, redirect to dashboard
                    router.push("/dashboard");
                }
            } catch (error) {
                // User is not authenticated, stay on auth page
                console.log("Not authenticated");
            }
        };

        checkAuth();
    }, [router]);

    return <>{children}</>;
}
