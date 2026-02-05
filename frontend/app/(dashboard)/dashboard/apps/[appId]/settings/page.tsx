"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSettingsForm } from "@/components/dashboard/app-settings-form";
import { LoanApp } from "@/hooks/user/loan-apps";
import { Button } from "@/components/ui/button";

type LoanAppResponse = {
    loanApp?: LoanApp;
    app?: LoanApp;
    data?: LoanApp;
};

type AppSettingsApp = {
    id: string;
    name: string;
    slug: string;
    isActive: boolean | null;
    createdAt: string;
    repaymentPlans: LoanApp["repaymentPlans"];
};

export default function AppSettingsPage() {
    const params = useParams<{ appId: string }>();
    const router = useRouter();
    const appId = params?.appId;
    const [app, setApp] = useState<LoanApp | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appId) return;
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        fetch(`/api/loan-apps/${appId}`)
            .then(async (res) => {
                const data = (await res.json()) as LoanAppResponse | LoanApp;
                if (!res.ok) {
                    const message = (data as { error?: string })?.error || "Failed to fetch loan app";
                    throw new Error(message);
                }
                return data;
            })
            .then((data) => {
                if (!isMounted) return;
                const payload = data as LoanAppResponse;
                const appData = payload.loanApp ?? payload.app ?? payload.data ?? (data as LoanApp);
                if (!appData?.id) {
                    setError("Loan app not found.");
                    return;
                }
                setApp(appData);
            })
            .catch((err: Error) => {
                if (!isMounted) return;
                setError(err.message);
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [appId]);

    const appData = useMemo<AppSettingsApp | null>(() => {
        if (!app) return null;
        const createdAt =
            app.createdAt instanceof Date
                ? app.createdAt.toISOString()
                : typeof app.createdAt === "string"
                    ? app.createdAt
                    : new Date().toISOString();
        return {
            ...app,
            createdAt,
            isActive: app.isActive ?? true,
        };
    }, [app]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-8 w-64 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-64 rounded-[32px] bg-gray-50 animate-pulse" />
            </div>
        );
    }

    if (error || !appData) {
        return (
            <div className="space-y-6">
                <p className="text-sm font-bold text-red-500">{error || "Unable to load this loan app."}</p>
                <Button variant="outline" className="border-gray-100 rounded-2xl font-bold h-11" onClick={() => router.push("/dashboard/apps")}>
                    Back to Apps
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">App Settings</h1>
                <p className="text-gray-500 font-medium">Configure settings for <span className="font-black text-main-green">{appData.name}</span></p>
            </div>

            <AppSettingsForm app={appData} />
        </div>
    );
}
