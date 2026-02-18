"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    Plus,
    ArrowUpRight,
    Lock,
    TrendingUp,
    Loader2,
    History,
    ChevronRight,
    Search,
    Filter,
    ArrowDownLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WalletBalances {
    balance: number;
    locked_balance: number;
    available_balance: number;
}

interface WalletTransaction {
    id: string;
    type: "funding_credit" | "loan_debit" | "repayment_credit" | "fee_debit";
    amount: number;
    reference: string;
    balanceAfter: number;
    createdAt: string;
    status?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount / 100);
};

export default function WalletPage() {
    const [isFunding, setIsFunding] = useState(false);
    const queryClient = useQueryClient();

    const { data: balances, isLoading: isLoadingBalances } = useQuery<WalletBalances>({
        queryKey: ["wallet-balances"],
        queryFn: () => fetch("/api/lender/wallet").then((res) => res.json()),
    });

    const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery<{ data: WalletTransaction[] }>({
        queryKey: ["wallet-transactions"],
        queryFn: () => fetch("/api/lender/wallet/transactions?limit=10").then((res) => res.json()),
    });

    const transactions = transactionsData?.data || [];

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "funding_credit": return <ArrowDownLeft className="text-green-500" />;
            case "loan_debit": return <ArrowUpRight className="text-red-500" />;
            case "repayment_credit": return <ArrowDownLeft className="text-blue-500" />;
            case "fee_debit": return <TrendingUp className="text-orange-500" />;
            default: return <Wallet className="text-gray-500" />;
        }
    };

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case "funding_credit": return "Wallet Funding";
            case "loan_debit": return "Loan Disbursement";
            case "repayment_credit": return "Loan Repayment";
            case "fee_debit": return "Platform Fee";
            default: return "Transaction";
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-12 bg-lemon-primary/10 text-main-green rounded-2xl flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-main-green tracking-tight">Logical Wallet</h1>
                        <p className="text-gray-500 text-sm font-medium">Manage your funds for loan disbursements.</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsFunding(true)}
                    className="bg-main-green text-white hover:bg-main-green/90 rounded-2xl px-6 h-12 font-bold shadow-lg shadow-main-green/20"
                >
                    <Plus className="mr-2 h-4 w-4" /> Fund Wallet
                </Button>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <BalanceCard
                    label="Available Balance"
                    amount={balances?.available_balance || 0}
                    icon={<Wallet className="text-main-green" />}
                    color="bg-lemon-primary/10"
                    isLoading={isLoadingBalances}
                    description="Funds ready for disbursement"
                />
                <BalanceCard
                    label="Locked Balance"
                    amount={balances?.locked_balance || 0}
                    icon={<Lock className="text-orange-500" />}
                    color="bg-orange-50"
                    isLoading={isLoadingBalances}
                    description="Committed to active loans"
                />
                <BalanceCard
                    label="Total Balance"
                    amount={balances?.balance || 0}
                    icon={<TrendingUp className="text-blue-500" />}
                    color="bg-blue-50"
                    isLoading={isLoadingBalances}
                    description="Combined wallet value"
                />
            </div>

            {/* Transactions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-main-green tracking-tight">Transaction History</h2>
                    <Button variant="ghost" className="text-gray-500 font-bold hover:text-main-green">
                        View All <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>

                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        {isLoadingTransactions ? (
                            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-main-green" size={40} />
                                <p className="text-gray-500 font-bold">Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center">
                                    <History className="text-gray-300" size={32} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-700">No transactions yet</h3>
                                    <p className="text-sm text-gray-500">Your wallet activity will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-main-green uppercase tracking-widest">Transaction</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-main-green uppercase tracking-widest">Reference</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-main-green uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-main-green uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                        {getTransactionIcon(tx.type)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-main-green">{getTransactionLabel(tx.type)}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{tx.type.replace("_", " ")}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <code className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">{tx.reference || "N/A"}</code>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {new Date(tx.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(tx.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className={cn(
                                                    "text-lg font-black",
                                                    tx.amount > 0 ? "text-main-green" : "text-red-500"
                                                )}>
                                                    {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>

            {/* Funding Modal */}
            <FundingModal isOpen={isFunding} onClose={() => setIsFunding(false)} />
        </div>
    );
}

function BalanceCard({
    label,
    amount,
    icon,
    color,
    isLoading,
    description
}: {
    label: string,
    amount: number,
    icon: React.ReactNode,
    color: string,
    isLoading: boolean,
    description: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-[32px]">
                <CardContent className="p-8 flex flex-col justify-between relative">
                    <div className={cn("absolute top-6 right-8 p-3 rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-500", color)}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">{label}</p>
                        {isLoading ? (
                            <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg" />
                        ) : (
                            <h3 className="text-3xl font-black text-main-green tracking-tight">
                                {formatCurrency(amount)}
                            </h3>
                        )}
                        <p className="text-xs text-gray-400 font-bold mt-4 flex items-center gap-1.5 uppercase tracking-wide">
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function FundingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount.replace(/,/g, ""));
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/lender/fund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numAmount * 100 }), // Backend expects kobo
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to initiate funding");

            toast.success("Redirecting to Paystack...");

            // Wait slightly for toast
            setTimeout(() => {
                window.location.href = data.data.authorization_url;
            }, 1000);
        } catch (error: any) {
            toast.error(error.message);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
            >
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="size-16 bg-lemon-primary/20 text-main-green rounded-[24px] flex items-center justify-center mx-auto mb-4">
                            <Plus size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-main-green">Fund Wallet</h2>
                        <p className="text-gray-500 text-sm font-medium px-4">
                            Top up your balance to handle more loan disbursements.
                        </p>
                    </div>

                    <form onSubmit={handleFund} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Amount (₦)</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-main-green transition-colors">
                                    ₦
                                </span>
                                <Input
                                    type="text"
                                    placeholder="50,000"
                                    className="h-16 bg-[#f8fbf7] border-gray-100 rounded-[24px] pl-12 pr-6 text-xl font-black focus-visible:ring-main-green focus-visible:bg-white transition-all"
                                    value={amount}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9.]/g, "");
                                        if (val === "" || !isNaN(parseFloat(val))) {
                                            setAmount(val);
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">
                                Paystack & Platform fees (₦200) will be deducted from net amount.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                disabled={isSubmitting}
                                className="w-full h-16 bg-main-green text-white hover:bg-main-green/90 rounded-[24px] text-lg font-black shadow-lg shadow-main-green/20"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" size={20} />}
                                Proceed to Pay
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="w-full h-12 text-gray-500 font-bold hover:text-gray-700"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
