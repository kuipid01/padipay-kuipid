"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2, XCircle } from "lucide-react";

import { SuspenseLoader } from "@/components/ui/suspense-loader";

function SubscriptionSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const plan = searchParams.get("plan");
    const reference = searchParams.get("reference");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                setIsLoading(false);
                setError("Transaction reference is missing.");
                return;
            }

            try {
                const response = await fetch("/api/subscription/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reference }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Payment verification failed.");
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error("Verification error:", err);
                setError(err.message || "An error occurred while verifying your payment.");
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [reference]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main-green to-main-green/80">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-lemon-primary animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold">
                        Verifying your subscription...
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                        Please don't close this page
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main-green to-main-green/80 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-main-green mb-4">
                        Verification Failed
                    </h1>

                    <p className="text-gray-600 mb-8 font-medium">
                        {error}
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full h-14 rounded-2xl text-lg font-black bg-lemon-primary text-main-green hover:bg-lemon-primary/90 shadow-lg shadow-lemon-primary/20"
                        >
                            Retry Verification
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard")}
                            className="w-full h-12 text-gray-500 font-bold hover:text-main-green"
                        >
                            Go to Dashboard anyway
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-main-green to-main-green/80 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-lemon-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-main-green" strokeWidth={3} />
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-main-green mb-4">
                    Subscription Activated!
                </h1>

                <p className="text-gray-600 text-lg mb-2">
                    Welcome to the <span className="font-bold text-main-green">{plan}</span> plan
                </p>

                {reference && (
                    <p className="text-sm text-gray-500 mb-8">
                        Reference: {reference}
                    </p>
                )}

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-main-green rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-lemon-primary" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700">Full access to all features</span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-main-green rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-lemon-primary" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700">Priority support enabled</span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-main-green rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-lemon-primary" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700">Advanced analytics unlocked</span>
                    </div>
                </div>

                <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-14 rounded-2xl text-lg font-black bg-lemon-primary text-main-green hover:bg-lemon-primary/90 shadow-lg shadow-lemon-primary/20"
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
}


export default function Page() {
    return (
        <Suspense fallback={<SuspenseLoader />}>
            <SubscriptionSuccessContent />
        </Suspense>
    );
}


