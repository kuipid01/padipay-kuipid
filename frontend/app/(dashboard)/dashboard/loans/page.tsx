
"use client"


import { LoansList } from "@/components/dashboard/loans-list";
import { PageHeader } from "@/components/ui/page-header";
import { useFetch } from "../../../../hooks/general";



type LoansResponse = any[];


export default function LoansPage() {
    const { data, isLoading, error } = useFetch<LoansResponse>("/api/loans", {
        key: "loans",
    });
    const loans = data ?? [];

    console.log(data, loans)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Active Loans"
                description="Track repayments and manage your active loan portfolio."
            />

            <LoansList initialLoans={loans} />
        </div>
    );
}
