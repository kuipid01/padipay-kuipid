"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApplicationActions({ applicationId }: { applicationId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleAction(action: "approve" | "reject") {
        setIsLoading(true);
        try {
            const endpoint = action === "approve"
                ? `/api/loans/${applicationId}/approve`
                : `/api/loans/${applicationId}/reject`;

            const res = await fetch(endpoint, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || `Failed to ${action} application`);

            toast.success(`Application ${action}d successfully`);
            router.refresh();
            router.push("/dashboard/applications");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex gap-3">
            <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleAction("reject")}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <XCircle className="mr-2" size={18} />}
                Reject
            </Button>
            <Button
                className="flex-1 shadow-lg shadow-primary/20"
                onClick={() => handleAction("approve")}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle className="mr-2" size={18} />}
                Approve Loan
            </Button>
        </div>
    );
}
