
"use client";

import { motion } from "framer-motion";
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    Wallet,
    TrendingUp,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
    totalMoneyLent: string;
    expectedRepayment: string;
    amountRepaid: string;
    outstandingBalance: string;
}

interface ActiveLoan {
    id: string;
    borrower: string;
    amount: string;
    interest: string;
    dueDate: string;
    status: string;
    amountLeft: string;
}

interface UpcomingPayment {
    id: string;
    amount: string;
    dueDate: string;
    borrower: string;
    method: string;
}

interface Activity {
    text: string;
    time: string;
    type: "payment" | "reminder" | "request";
}

export function OverviewClient() {
    const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        queryFn: () => fetch("/api/dashboard/stats").then((res) => res.json()),
    });

    const { data: activeLoans, isLoading: isLoadingLoans } = useQuery<ActiveLoan[]>({
        queryKey: ["active-loans"],
        queryFn: () => fetch("/api/dashboard/active-loans").then((res) => res.json()),
    });

    const { data: upcomingPayments, isLoading: isLoadingPayments } = useQuery<UpcomingPayment[]>({
        queryKey: ["upcoming-payments"],
        queryFn: () => fetch("/api/dashboard/upcoming-payments").then((res) => res.json()),
    });

    const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<Activity[]>({
        queryKey: ["recent-activity"],
        queryFn: () => fetch("/api/dashboard/recent-activity").then((res) => res.json()),
    });

    const safeFormatDate = (dateStr: string | undefined, formatStr: string) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "N/A";
            return format(date, formatStr);
        } catch (e) {
            return "N/A";
        }
    };

    const formatCurrency = (amount: string | number | undefined) => {
        const val = Number(amount || 0);
        return `₦${val.toLocaleString()}`;
    };

    const topStats = [
        { label: "Total Money Lent", value: formatCurrency(stats?.totalMoneyLent), icon: <CreditCard className="text-blue-500" />, trend: "+12.5%", color: "bg-blue-50" },
        { label: "Expected Repayment", value: formatCurrency(stats?.expectedRepayment), icon: <TrendingUp className="text-violet-500" />, trend: "+15.0%", color: "bg-violet-50" },
        { label: "Amount Repaid", value: formatCurrency(stats?.amountRepaid), icon: <ArrowDownLeft className="text-green-500" />, trend: "60% success", color: "bg-green-50" },
        { label: "Outstanding Balance", value: formatCurrency(stats?.outstandingBalance), icon: <Clock className="text-orange-500" />, trend: "40% left", color: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* 1. Top Summary (Money Snapshot) & 7. Wallet */}
            <div className="flex flex-col gap-6">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {isLoadingStats ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="border-main-green/20 shadow-sm overflow-hidden">
                                <CardContent className="p-6">
                                    <Skeleton className="h-3 w-24 mb-2" />
                                    <Skeleton className="h-8 w-32 mb-4" />
                                    <Skeleton className="h-4 w-16" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        topStats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="border-main-green/20 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                    <CardContent className="p-6 flex flex-col justify-between relative">
                                        <div className={cn("absolute top-0 right-0 m-4 w-fit h-fit opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:opacity-50", stat.color)}>
                                            {stat.icon}
                                        </div>
                                        <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black text-main-green">{stat.value}</h3>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-green-50 text-green-600 text-[10px] font-black border-none">
                                                {stat.trend}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-gray-400">vs last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
                <div className="flex flex-col lg:flex-row w-full justify-between gap-6 lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 max-h-[80vh] w-full"
                    >
                        <Card className="bg-main-green text-white border-none h-full shadow-xl relative overflow-hidden group min-h-[240px]">
                            <div className="absolute top-0 right-0 size-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-colors" />
                            <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <Wallet size={24} className="text-lemon-primary" />
                                        <Badge className="bg-white/10 text-white font-bold border-none backdrop-blur-md">Payout Ready</Badge>
                                    </div>
                                    <p className="text-xs font-bold text-white/60 mb-1">Total Balance</p>
                                    <h2 className="text-2xl md:text-3xl font-black mb-2">₦420,500.00</h2>
                                </div>
                                <div className="mt-4 lg:mt-8 pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-4 tracking-wider">Linked Account</p>
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded bg-white/10 flex items-center justify-center">
                                            <CheckCircle2 size={16} className="text-lemon-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Access Bank</p>
                                            <p className="text-xs text-white/40">**** 8902</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <Image src="/cc.png" width={400} height={300} className="object-cover absolute -right-[50px] -bottom-[100px] w-[300px] md:w-[400px]" alt="CREDIT CARD" />
                        </Card>
                    </motion.div>
                    {/* 3. Upcoming Payments */}
                    <div className="w-full max-h-[80vh] overflow-y-auto lg:w-[400px]">
                        <h2 className="text-xl font-black text-main-green tracking-tight mb-6">Upcoming Payments</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {isLoadingPayments ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-5 bg-white rounded-3xl border border-gray-100 flex gap-4">
                                        <Skeleton className="size-12 rounded-2xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : upcomingPayments && upcomingPayments.length > 0 ? (
                                upcomingPayments.map((payment, i) => (
                                    <motion.div
                                        key={payment.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 h-full w-1.5 bg-lemon-primary" />
                                        <div className="size-12 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 text-main-green shrink-0">
                                            <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">{safeFormatDate(payment.dueDate, "MMM")}</span>
                                            <span className="text-lg font-black leading-none">{safeFormatDate(payment.dueDate, "dd")}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-bold text-main-green truncate">{formatCurrency(payment.amount)}</h4>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase border-gray-100">{payment.method || "N/A"}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium truncate">{payment.borrower || "Unknown Borrower"}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                                                <Clock size={10} /> Due {safeFormatDate(payment.dueDate, "h:mm a")}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-400 font-medium">No upcoming payments</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* 2. Active Loans */}
                <div className="xl:col-span-12 space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-black text-main-green tracking-tight">Active Loans</h2>
                        <Button variant="link" className="text-main-green font-bold" asChild>
                            <Link href="/dashboard/loans">View all loans <ArrowUpRight size={16} className="ml-1" /></Link>
                        </Button>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[800px] xl:min-w-full">
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest px-6 h-12">Borrower</TableHead>
                                        <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-12">Amount</TableHead>
                                        <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-12">Status</TableHead>
                                        <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-12">Due Date</TableHead>
                                        <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest text-right px-6 h-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingLoans ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-gray-100">
                                                <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell className="py-4"><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell className="py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell className="py-4"><Skeleton className="h-5 w-28" /></TableCell>
                                                <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded-md inline-block" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : activeLoans && activeLoans.length > 0 ? (
                                        activeLoans.map((loan) => (
                                            <TableRow key={loan.id} className="hover:bg-gray-50/50 transition-colors border-gray-100 group">
                                                <TableCell className="px-6 py-4">
                                                    <p className="font-bold text-main-green group-hover:text-primary transition-colors whitespace-nowrap">{loan.borrower || "Unknown Borrower"}</p>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <p className="font-bold whitespace-nowrap">{formatCurrency(loan.amount)}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">at {loan.interest || 0}% interest</p>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge
                                                        className={cn(
                                                            "font-bold text-[10px] border-none whitespace-nowrap",
                                                            (loan.status === "On Track" || !loan.status) && "bg-green-50 text-green-600",
                                                            loan.status === "Due Soon" && "bg-orange-50 text-orange-600",
                                                            loan.status === "Overdue" && "bg-red-50 text-red-600"
                                                        )}
                                                    >
                                                        {loan.status || "On Track"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-gray-500 font-medium text-sm whitespace-nowrap">
                                                    {safeFormatDate(loan.dueDate, "yyyy-MM-dd")}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center">
                                                <p className="text-sm text-gray-400 font-medium">No active loans found</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 5. Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction
                    title="Create Loan"
                    subtitle="New Application"
                    imageSrc="/folder.png"
                    gradient="from-yellow-100 to-orange-100"
                    textColor="text-orange-900"
                    href="/dashboard/apps"
                />
                <QuickAction
                    title="Generate Link"
                    subtitle="Shareable URL"
                    imageSrc="/link.png"
                    gradient="from-blue-100 to-indigo-100"
                    textColor="text-blue-900"
                    href="/dashboard/apps"
                />
                <QuickAction
                    title="Add Borrower"
                    subtitle="KYC & Data"
                    imageSrc="/plus.png"
                    gradient="from-green-100 to-emerald-100"
                    textColor="text-emerald-900"
                    href="/dashboard/applications"
                />

                <QuickAction
                    title="Settings"
                    subtitle="Default Terms"
                    imageSrc="/settings.png"
                    gradient="from-gray-100 to-slate-200"
                    textColor="text-slate-900"
                    href="/dashboard/settings"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                <div className="lg:col-span-6 space-y-8">
                    {/* 4. Loan Performance Breakdown */}
                    <Card className="border-none shadow-sm bg-[#FAFAFA] rounded-[32px] overflow-hidden">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-lg font-black text-main-green">Performance Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8">
                                <div className="space-y-4 w-full sm:w-auto">
                                    <PerformanceIndicator label="On-time" color="bg-green-500" value="85%" />
                                    <PerformanceIndicator label="Late" color="bg-orange-500" value="12%" />
                                    <PerformanceIndicator label="Defaulted" color="bg-red-500" value="3%" />
                                </div>
                                <div className="size-32 rounded-full border-[12px] border-green-500 border-t-orange-500 border-l-red-500/20 relative flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-black text-main-green">97%</span>
                                </div>
                            </div>
                            <Button className="w-full bg-white text-main-green border border-gray-100 rounded-2xl font-black h-12 shadow-sm hover:bg-gray-50">
                                Detailed Report
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* 6. Recent Activity Feed */}
                    <div>
                        <h2 className="text-xl font-black text-main-green tracking-tight mb-6">Recent Activity</h2>
                        <div className="relative pl-6 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {isLoadingActivity ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="relative pl-2">
                                        <Skeleton className="h-4 w-full mb-1" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                ))
                            ) : recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((activity, i) => (
                                    <div key={i} className="relative group">
                                        <div className="absolute -left-6 top-1.5 size-3 rounded-full border-2 border-white bg-lemon-primary ring-4 ring-lemon-primary/20 z-10" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 leading-snug group-hover:text-main-green transition-colors">{activity.text || "No activity text"}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                {safeFormatDate(activity.time, "MMM d, h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickAction({
    title,
    subtitle,
    imageSrc,
    href,
    gradient,
    textColor
}: {
    title: string;
    subtitle: string;
    imageSrc: string;
    href: string;
    gradient: string;
    textColor: string;
}) {
    return (
        <Link href={href} className="group relative block h-40 w-full">
            {/* Card Container */}
            <div className={cn(
                "relative h-full w-full overflow-hidden rounded-[24px] bg-linear-to-br p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl",
                gradient
            )}>
                {/* Text Content */}
                <div className="relative z-10 flex flex-col items-start gap-1">
                    <span className={cn("text-xs font-bold uppercase tracking-wider opacity-60", textColor)}>
                        {subtitle}
                    </span>
                    <h3 className={cn("text-lg font-black leading-tight", textColor)}>
                        {title}
                    </h3>
                </div>

                {/* Arrow Icon (Interactivity) */}
                <div className={cn(
                    "absolute bottom-4 left-4 flex size-8 items-center justify-center rounded-full bg-white/40 opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-sm",
                    textColor
                )}>
                    <ArrowUpRight size={16} />
                </div>

                {/* 3D Image */}
                <div className="absolute -bottom-4 -right-4 size-24 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-right-2 group-hover:-bottom-2  group-hover:-rotate-6 md:size-28">
                    {/* Use Next.js Image component in real app */}
                    <img
                        src={imageSrc}
                        alt={title}
                        className="h-full w-full object-contain drop-shadow-2xl"
                    />
                </div>
            </div>
        </Link>
    );
}

function PerformanceIndicator({ label, color, value }: { label: string; color: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={cn("size-2 rounded-full", color)} />
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-main-green leading-none">{value}</p>
            </div>
        </div>
    );
}
