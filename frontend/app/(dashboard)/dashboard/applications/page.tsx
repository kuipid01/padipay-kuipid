"use client";

import { ApplicationsList } from "@/components/dashboard/applications-list";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/general";

type ApplicationsResponse = {
    applications: any[];
};

export default function ApplicationsPage() {
    const { data, isLoading, error } = useFetch<ApplicationsResponse>("/api/loan-applications", {
        key: "loan-applications",
    });
    const applications = data?.applications ?? [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">Loan Applications</h1>
                <p className="text-gray-500 font-medium">Scan, filter, and review incoming borrower requests with ease.</p>
            </div>

            {isLoading ? (
                <div className="h-64 rounded-[32px] bg-gray-50 animate-pulse" />
            ) : error ? (
                <div className="space-y-4">
                    <p className="text-sm font-bold text-red-500">Failed to load applications.</p>
                    <Button variant="outline" className="border-gray-100 rounded-2xl font-bold h-11">
                        Retry
                    </Button>
                </div>
            ) : (
                <ApplicationsList initialApplications={applications} />
            )}
        </div>
    );
}
