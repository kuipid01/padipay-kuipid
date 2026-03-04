"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, CreditCard, Loader2, Calendar, AlertCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Wait, I'll check if lib/utils has it or define locally
import { useBorrower, useUser } from "@/hooks/use-user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RepaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: any; // UnifiedHistoryItem
}

export function RepaymentModal({ isOpen, onClose, loan }: RepaymentModalProps) {
    const { borrower } = useBorrower();
    console.log(borrower, "borrowers")
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    console.log(loan, "loan")
    useEffect(() => {
        if (loan && loan.loan && loan.loan.repayments) {
            // Find the first pending repayment
            const nextRepayment = loan.loan.repayments.find((r: any) => r.status === "PENDING");
            getAmountToPay(loan.loan.repayments)
            console.log("allReapyments", loan.loan.repayments)
            console.log("nextRepayment", nextRepayment)
            if (nextRepayment) {
                // Use the amount from the specific repayment record
                setAmount(parseFloat(nextRepayment.amount).toFixed(0));
            } else {
                // Fallback to calculation if no repayments found
                const totalPayable = parseFloat(loan.loan.totalPayable);
                const duration = loan.application?.durationMonths || 12;
                const monthlyRepayment = (totalPayable / duration).toFixed(0);
                setAmount(monthlyRepayment);
            }
        }
    }, [loan, isOpen]);
    const getAmountToPay = (repayments: any) => {
        const allValidPayments = repayments.map((r: any) => r.status === "PENDING");
        const allSubPayments = repayments.map((r: any) => r.status === "SUCCESS");
    }
    const handleRepay = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!borrower?.email) {
            toast.error("User email not found. Please log in again.");
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "REPAYMENT",
                    callback: "repayment_success",
                    callbackUrl: window.location.href,
                    borrowerEmail: borrower?.email,
                    loanAppSlug: loan.id,
                    amount: amount,
                    loan_id: loan.loan?.id
                }),
            });

            const data = await response.json();

            if (data.status && data.data.authorization_url) {
                window.location.href = data.data.authorization_url;
            } else {
                throw new Error(data.message || "Failed to initialize payment");
            }
        } catch (error: any) {
            console.error("Payment init error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!loan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full sm:max-w-[60%] p-0  max-h-[99vh] overflow-y-auto border-none rounded-[40px] shadow-2xl bg-white focus:outline-none">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-lemon-primary/10 p-10 flex items-center gap-6 border-b border-lemon-primary/10"
                        >
                            <div className="size-20 bg-white rounded-[24px] flex items-center justify-center text-main-green shadow-xl shadow-lemon-primary/20 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Banknote size={40} />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black text-main-green leading-tight">Repay Loan</DialogTitle>
                                <DialogDescription className="text-gray-500 font-bold text-lg">
                                    Continue your journey to financial freedom.
                                </DialogDescription>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-10 space-y-10">
                    {/* Loan Info Strip */}
                    <div className="flex items-center justify-between gap-4 p-6 rounded-[32px] bg-linear-to-br from-gray-50 to-white border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 size-24 bg-lemon-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Product</p>
                            <h4 className="text-lg font-black text-main-green">{loan.title}</h4>
                        </div>
                        <div className="text-right space-y-1 relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Liability</p>
                            <p className="text-xl font-black text-gray-900">{formatCurrency(loan.loan?.totalPayable || "0")}</p>
                        </div>
                    </div>

                    {/* Amount Input Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                            <Label htmlFor="amount" className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                Repayment Amount
                            </Label>
                            <span className="text-[11px] font-black text-main-green/60 uppercase tracking-widest leading-none">
                                Edit to Customize
                            </span>
                        </div>

                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-4xl select-none group-focus-within:text-main-green transition-colors">
                                ₦
                            </div>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-28 pl-16 pr-8 rounded-[32px] border-2 border-gray-100 focus:border-main-green focus:ring-8 focus:ring-lemon-primary/10 transition-all font-black text-5xl text-main-green shadow-inner bg-gray-50/30 selection:bg-lemon-primary/30"
                                placeholder="0"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -top-3 -right-3 size-12 bg-lemon-primary rounded-2xl flex items-center justify-center text-main-green shadow-lg shadow-lemon-primary/20 transform rotate-12 transition-all hover:rotate-0"
                            >
                                <TrendingUp size={24} />
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-3 p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                            <AlertCircle size={18} className="text-amber-600 shrink-0" />
                            <p className="text-[11px] text-amber-900 font-bold italic leading-relaxed">
                                Enter your preferred repayment amount. We recommend sticking to your monthly plan of <span className="text-amber-700 underline decoration-2 underline-offset-2">{formatCurrency(amount || 0)}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-10 pt-0 flex flex-col! gap-6">
                    <Button
                        onClick={handleRepay}
                        disabled={isLoading}
                        className="w-full bg-main-green hover:bg-main-green/90 text-white rounded-[24px] h-20 font-black text-2xl shadow-2xl shadow-main-green/30 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                        {isLoading ? (
                            <Loader2 size={32} className="animate-spin" />
                        ) : (
                            <div className="flex items-center gap-4">
                                <CreditCard className="size-8 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
                                Proceed to Pay
                            </div>
                        )}
                    </Button>

                    <div className="flex items-center justify-center gap-6 opacity-40">
                        <div className="h-px bg-gray-200 flex-1" />
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] whitespace-nowrap">
                            Powered by Paystack Secure
                        </p>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
