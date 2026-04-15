"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function RepaymentChargeButton({ repaymentId, amount }: { repaymentId: string, amount: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleCharge() {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/repayments/${repaymentId}/charge`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Charge failed");

            toast.success("Repayment charged successfully!");
            setOpen(false);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const formattedAmount = parseFloat(amount).toLocaleString();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 rounded-xl border-gray-100 font-bold bg-white text-gray-700 hover:bg-main-green/10 hover:text-main-green hover:border-main-green/20 transition-all duration-300 gap-2 shadow-sm"
                >
                    <CreditCard size={14} className="text-main-green" />
                    <span>Charge Card</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[40px] sm:max-w-[440px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-main-green/5 to-transparent p-10">
                    <DialogHeader>
                        <div className="size-16 rounded-[24px] bg-main-green/10 flex items-center justify-center text-main-green mb-6 ring-8 ring-main-green/5">
                            <CreditCard size={32} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-gray-900 leading-tight">Confirm Repayment</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium pt-2 leading-relaxed">
                            You are initiating an automated charge for this installment. This will attempt to secure funds from the borrower's primary payment method.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-white/50 backdrop-blur-sm rounded-[32px] p-8 mt-8 border border-white/50 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total amount due</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-main-green">₦</span>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">{formattedAmount}</h3>
                        </div>
                    </div>

                    <DialogFooter className="mt-10 flex flex-col sm:flex-col gap-3 space-x-0">
                        <Button
                            onClick={handleCharge}
                            disabled={isLoading}
                            className="w-full h-16 rounded-[24px] bg-main-green hover:bg-main-green/90 text-white font-black text-lg shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin mr-3" size={24} />
                                    Charging...
                                </>
                            ) : (
                                "Initiate Payment"
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full h-12 rounded-2xl text-gray-400 font-bold hover:text-gray-600 hover:bg-gray-100/50"
                        >
                            Cancel Transaction
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
