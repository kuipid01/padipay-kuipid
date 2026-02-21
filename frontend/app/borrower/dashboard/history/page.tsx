"use client";

import { AlertCircle, ArrowRight, Banknote, Calendar, CheckCircle2, Clock, History, LucideIcon, MoreVertical, RefreshCcw, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// --- Types ---

export type LoanAppStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LoanStatus = "ACTIVE" | "COMPLETED" | "DEFAULTED";

export interface LoanApplication {
    id: string;
    loanAppId: string;
    repaymentPlanId: string;
    borrowerId: string;
    amount: string;
    durationMonths: number;
    status: LoanAppStatus;
    createdAt: string;
    loanAppName?: string; // App name for UI
}

export interface Loan {
    id: string;
    applicationId: string;
    lenderId: string;
    borrowerId: string;
    principal: string;
    interest: string;
    totalPayable: string;
    startDate: string;
    status: LoanStatus;
    loanName?: string; // Optional name for UI
}

type UnifiedHistoryItem = {
    id: string;
    type: "APPLICATION" | "LOAN";
    date: string;
    title: string;
    amount: string;
    status: LoanAppStatus | LoanStatus;
    application?: LoanApplication;
    loan?: Loan;
};

// --- Utilities ---

const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(Number(amount));
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// --- Page Component ---

export default function LoanHistoryPage() {
    const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) setIsRefreshing(true);
            else setIsLoading(true);

            // Fetch both applications and loans in parallel
            // Note: API paths are assumed based on borrower proxy structure
            const [appsRes, loansRes] = await Promise.all([
                fetch("/api/borrower/applications", { headers: { "Content-Type": "application/json" } }),
                fetch("/api/borrower/loans", { headers: { "Content-Type": "application/json" } })
            ]);

            if (!appsRes.ok || !loansRes.ok) throw new Error("Could not sync with the server.");

            const appsData: LoanApplication[] = await appsRes.json();
            const loansData: Loan[] = await loansRes.json();

            // Unified processing logic: 
            // 1. Start with all applications.
            // 2. Link loans to approved applications.
            // 3. Include any loans that might not have a visible application record (fallback).

            const processedHistory: UnifiedHistoryItem[] = appsData.map(app => {
                const linkedLoan = loansData.find(l => l.applicationId === app.id);
                return {
                    id: app.id,
                    type: linkedLoan ? "LOAN" : "APPLICATION",
                    date: app.createdAt,
                    title: app.loanAppName || "Personal Finance Loan",
                    amount: linkedLoan ? linkedLoan.principal : app.amount,
                    status: linkedLoan ? linkedLoan.status : app.status,
                    application: app,
                    loan: linkedLoan
                };
            });

            // Add any orphan loans (though logic-wise they shouldn't exist if application-linked)
            loansData.forEach(loan => {
                if (!processedHistory.some(item => item.loan?.id === loan.id)) {
                    processedHistory.push({
                        id: loan.id,
                        type: "LOAN",
                        date: loan.startDate,
                        title: loan.loanName || "Active Loan Record",
                        amount: loan.principal,
                        status: loan.status,
                        loan: loan
                    });
                }
            });

            // Sort by most recent date
            processedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(processedHistory);
            setError(null);

            if (isManualRefresh) toast.success("History successfully updated.");
        } catch (err) {
            console.error("History Sync Error:", err);
            setError("Failed to sync your history. Please try again.");
            if (isManualRefresh) toast.error("Update failed. Check your connection.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);



    useEffect(() => {
        fetchData();

    }, [fetchData]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: Clock, variant: "outline" as const };
            case "APPROVED":
                return { label: "Approved!", color: "bg-green-100 text-green-700", icon: CheckCircle2, variant: "default" as const };
            case "REJECTED":
                return { label: "Declined", color: "bg-red-100 text-red-700", icon: XCircle, variant: "destructive" as const };
            case "ACTIVE":
                return { label: "Active Loan", color: "bg-lemon-primary/10 text-main-green border-lemon-primary/30", icon: TrendingUp, variant: "secondary" as const };
            case "COMPLETED":
                return { label: "Fully Repaid", color: "bg-blue-100 text-blue-700", icon: CheckCircle2, variant: "secondary" as const };
            case "DEFAULTED":
                return { label: "Overdue", color: "bg-red-600 text-white", icon: AlertCircle, variant: "destructive" as const };
            default:
                return { label: status, color: "bg-gray-100 text-gray-600", icon: History, variant: "outline" as const };
        }
    };
    console.log(isLoading, "isLoading")
    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* --- Header Section --- */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-5">
                    <div className="size-16 bg-lemon-primary/10 text-main-green rounded-[22px] flex items-center justify-center shadow-inner-sm">
                        <History size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-main-green tracking-tight">Loan History</h1>
                        <p className="text-gray-500 font-medium text-lg">Manage your applications and track active loans.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing}
                        className="rounded-2xl h-14 px-5 font-bold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        <RefreshCcw className={cn("mr-2 size-5", isRefreshing && "animate-spin")} />
                        Sync Status
                    </Button>
                    <Button className="bg-main-green hover:bg-main-green/90 text-white rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-main-green/20 group">
                        Apply Now
                        <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </motion.div>

            {/* --- Statistics Strip --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: "Total Apps", value: history.filter(i => i.application).length, icon: History, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Loans", value: history.filter(i => i.status === "ACTIVE").length, icon: TrendingUp, color: "text-green-600", bg: "bg-emerald-50" },
                    { label: "Repaid", value: history.filter(i => i.status === "COMPLETED").length, icon: CheckCircle2, color: "text-main-green", bg: "bg-lemon-primary/10" },
                    { label: "Pending", value: history.filter(i => i.status === "PENDING").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm flex flex-col gap-3"
                    >
                        <div className={cn("size-10 rounded-xl flex items-center justify-center", stat.bg)}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- List Section --- */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[40px]" />)}
                    </div>
                ) : history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[50px] border-2 border-dashed border-gray-100 min-h-[400px] flex flex-col items-center justify-center p-12 text-center"
                    >
                        <div className="size-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                            <Banknote className="size-12 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Clean Slate!</h2>
                        <p className="text-gray-500 font-medium max-w-sm mb-10">You haven&apos;t started any loan journeys yet. Your history will be tracked here once you make an application.</p>
                        <Button className="bg-main-green hover:bg-main-green/90 text-white rounded-full px-12 h-16 font-black text-xl shadow-2xl shadow-main-green/30">
                            Apply for your first loan
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {history.map((item, idx) => {
                                const config = getStatusConfig(item.status);
                                const StatusIcon = config.icon;
                                const isLoan = item.type === "LOAN";

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className={cn(
                                            "group overflow-hidden border-2 transition-all duration-300 rounded-[40px] hover:shadow-2xl hover:shadow-lemon-primary/10",
                                            isLoan ? "border-lemon-primary/40 hover:border-lemon-primary" : "border-gray-100 hover:border-gray-200"
                                        )}>
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row">
                                                    {/* Info Primary */}
                                                    <div className="p-8 md:p-10 flex-1 space-y-10">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={cn("px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider", config.color, "border-none shadow-sm")}>
                                                                        <StatusIcon size={14} className="mr-2" />
                                                                        {config.label}
                                                                    </Badge>
                                                                    {isLoan && <Badge variant="outline" className="px-4 py-1.5 rounded-full font-bold text-xs text-main-green border-main-green/20">Active Loan</Badge>}
                                                                </div>
                                                                <h3 className="text-2xl md:text-3xl font-black text-main-green leading-tight">
                                                                    {item.title}
                                                                </h3>
                                                                <div className="flex flex-wrap items-center gap-6 text-gray-400 font-bold text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar size={18} className="text-main-green" />
                                                                        {isLoan ? "Started" : "Applied"} on {formatDate(item.date)}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock size={18} className="text-main-green" />
                                                                        Ref: #{item.id.split('-')[0].toUpperCase()}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="rounded-2xl size-14 hover:bg-gray-100 transition-colors">
                                                                        <MoreVertical size={24} />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="rounded-2xl p-3 min-w-[220px] shadow-2xl border-gray-100">
                                                                    <DropdownMenuItem className="py-3 px-4 rounded-xl font-bold cursor-pointer">View Statement</DropdownMenuItem>
                                                                    <DropdownMenuItem className="py-3 px-4 rounded-xl font-bold cursor-pointer">Transaction Details</DropdownMenuItem>
                                                                    {item.status === "ACTIVE" && (
                                                                        <DropdownMenuItem className="py-3 px-4 rounded-xl font-bold text-main-green cursor-pointer">Repayment Terms</DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem className="py-3 px-4 rounded-xl font-bold text-red-500 cursor-pointer">Report Issue</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        {/* Financial Data Bar */}
                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-gray-50/80">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                                                                <p className="text-2xl font-black text-gray-900">{formatCurrency(item.amount)}</p>
                                                            </div>

                                                            {isLoan && item.loan ? (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest Rate</p>
                                                                        <p className="text-2xl font-black text-main-green">+{formatCurrency(item.loan.interest)}</p>
                                                                    </div>
                                                                    <div className="space-y-2 col-span-2">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Liability</p>
                                                                        <p className="text-2xl font-black text-gray-900">{formatCurrency(item.loan.totalPayable)}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                                                                        <p className="text-2xl font-black text-gray-900">{item.application?.durationMonths} Mo.</p>
                                                                    </div>
                                                                    <div className="col-span-2 bg-gray-50/50 p-4 rounded-2xl flex items-center gap-3">
                                                                        <div className="size-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                                            <TrendingUp size={14} className="text-main-green" />
                                                                        </div>
                                                                        <p className="text-sm font-bold text-gray-500 italic">
                                                                            {item.status === "PENDING" ? "Estimated disbursement within 24-48 hours upon approval." : "This application has been processed."}
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Sidebar Area */}
                                                    <div className={cn(
                                                        "md:w-72 p-10 flex md:flex-col justify-center gap-5 items-center border-t md:border-t-0 md:border-l border-gray-100",
                                                        isLoan ? "bg-emerald-50/20" : "bg-gray-50/30"
                                                    )}>
                                                        <Button className="w-full bg-white hover:bg-gray-50 text-main-green border-gray-200 border-2 rounded-2xl font-black h-16 shadow-sm transition-all hover:scale-[1.03] active:scale-95">
                                                            Details
                                                        </Button>
                                                        {item.status === "ACTIVE" && (
                                                            <Button className="w-full bg-main-green text-white hover:bg-main-green/90 rounded-2xl font-black h-16 shadow-xl shadow-main-green/20 transition-all hover:scale-[1.03] active:scale-95">
                                                                Repay Now
                                                            </Button>
                                                        )}
                                                        {item.status === "PENDING" && (
                                                            <div className="text-center w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Awaiting Lender</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* --- Error Fallback --- */}
            {error && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-3 animate-bounce">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
        </div>
    );
}
