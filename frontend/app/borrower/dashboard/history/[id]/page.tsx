"use client";

import { ApplicationDetails } from "@/components/dashboard/application-details";
import { useFetch } from "@/hooks/general";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoanApplicationDetails } from "../../../../../components/borrower/borrower-details";
import { Application } from "../../../../../components/dashboard/application-details/types";
import { Loan } from "../page";




export interface ApplicationDetails {
    application: Application;
    loan: Loan;
}
export default function BorrowerApplicationDetailPage() {
    const params = useParams<{ id: string }>();


    // Fetch from the borrower-specific API proxy
    const { data: application, isLoading } = useFetch<ApplicationDetails>(
        `/api/borrower/applications/${params.id}`,
    );


    console.log(application, "main application returned")

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 rounded-full bg-lemon-primary/10">
                    <Loader2 className="w-10 h-10 text-main-green animate-spin" />
                </div>
                <p className="text-gray-500 font-medium animate-pulse">
                    Loading your application details...
                </p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="p-6 rounded-full bg-red-50 border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">
                        Application Not Found
                    </h2>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                        The application you are looking for does not exist or you don't have permission to view it.
                    </p>
                </div>
                <Button
                    className="bg-main-green hover:bg-main-green/90 text-white font-bold"
                    asChild
                >
                    <Link href="/borrower/dashboard/history">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to History
                    </Link>
                </Button>
            </div>
        );
    }

    // The hook returns the full response, we need the application object inside it
    // Assuming standardized response structure { status: true, data: { ... } } or similar
    const appData = application.application;
    const loanData = application.loan;

    return (
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoanApplicationDetails application={appData} loan={loanData} />
        </div>
    );
}
