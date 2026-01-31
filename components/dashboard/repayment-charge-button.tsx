"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export function RepaymentChargeButton({ repaymentId, amount }: { repaymentId: string, amount: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleCharge() {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/repayments/${repaymentId}/charge`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Charge failed");

            toast.success("Repayment charged successfully!");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleCharge}
            disabled={isLoading}
            className="h-8 gap-1"
        >
            {isLoading ? <Loader2 className="animate-spin" size={14} /> : <DollarSign size={14} />}
            Charge Card
        </Button>
    );
}
