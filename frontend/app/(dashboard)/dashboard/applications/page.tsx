"use client";

import { ApplicationsList } from "@/components/dashboard/applications-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/dashboard/skeletons";
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
        <div className="space-y-6">
            <PageHeader
                title="Loan Applications"
                description="Scan, filter, and review incoming borrower requests with ease."
            />

            {isLoading ? (
                <TableSkeleton rows={6} columns={6} />
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
