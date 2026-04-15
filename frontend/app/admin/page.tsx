"use client";

import {
    FileText, Users, Building2, TrendingUp, DollarSign, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useAdminOverview, useAdminRequests } from "@/hooks/admin";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; classes: string }> = {
    PENDING: { label: "Pending", classes: "bg-orange-50 text-orange-600" },
    APPROVED: { label: "Approved", classes: "bg-green-50 text-green-600" },
    FUNDED: { label: "Funded", classes: "bg-blue-50 text-blue-600" },
    REJECTED: { label: "Rejected", classes: "bg-red-50 text-red-600" },
};

export default function AdminOverviewPage() {
    const { data: overview, isLoading: overviewLoading } = useAdminOverview();
    const { data: requestsData, isLoading: requestsLoading } = useAdminRequests({ limit: 5 });

    const stats = [
        { label: "Total Requests", value: overview?.totalRequests ?? "-", change: `${overview?.pendingRequests ?? 0} pending`, icon: FileText, color: "bg-violet-50 text-violet-500" },
        { label: "Active Borrowers", value: overview?.totalBorrowers ?? "-", change: "registered", icon: Users, color: "bg-blue-50 text-blue-500" },
        { label: "Active Lenders", value: overview?.activeLenders ?? "-", change: "on platform", icon: Building2, color: "bg-lemon-primary/20 text-main-green" },
        { label: "Funds Disbursed", value: overview ? formatCurrency(overview.totalDisbursedNGN) : "-", change: "total", icon: DollarSign, color: "bg-green-50 text-green-500" },
    ];

    const alerts = [
        overview?.pendingRequests && `${overview.pendingRequests} loan applications are currently pending review.`,
        overview?.pendingKycLenders && `${overview.pendingKycLenders} lenders have not completed KYC verification.`,
        overview?.overdueRepayments && `${overview.overdueRepayments} repayment(s) are overdue.`,
    ].filter(Boolean) as string[];

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs font-black text-[#1F4941]/40 uppercase tracking-widest mb-1">Welcome back</p>
                    <h1 className="text-3xl font-black text-[#1F4941]">Admin Overview</h1>
                    <p className="text-gray-500 font-medium mt-1">Monitor platform activity across all users.</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                    System Operational
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map((stat) =>
                    overviewLoading ? (
                        <Card key={stat.label} className="border-none shadow-sm rounded-[24px]">
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-10 w-10 rounded-2xl" />
                                <Skeleton className="h-3 w-24 rounded-full" />
                                <Skeleton className="h-7 w-20 rounded-full" />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card key={stat.label} className="border-none shadow-sm rounded-[24px] bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("size-10 rounded-2xl flex items-center justify-center", stat.color)}>
                                        <stat.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{stat.change}</span>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-[#1F4941]">{stat.value.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>

            {/* Recent Requests */}
            <Card className="border-none shadow-sm rounded-[32px] bg-white">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-[#1F4941]">Recent Funding Requests</h2>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">Latest applications requiring review</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-100 rounded-xl font-bold gap-2 text-[#1F4941]" asChild>
                            <Link href="/admin/requests">View All <ArrowUpRight size={14} /></Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {requestsLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="size-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3.5 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-3.5 w-20" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                </div>
                            ))
                            : requestsData?.requests.map((req) => {
                                const s = statusConfig[req.status] ?? { label: req.status, classes: "bg-gray-100 text-gray-500" };
                                const borrowerName = `${req.borrower.firstName} ${req.borrower.lastName}`;
                                return (
                                    <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/60 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-[#1F4941]/10 flex items-center justify-center font-black text-[#1F4941] text-sm shrink-0">
                                                {borrowerName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1F4941] text-sm">{borrowerName}</p>
                                                <p className="text-xs text-gray-400 font-medium">{req.borrower.email} · via {req.lender.businessName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black text-[#1F4941] text-sm hidden sm:block">{formatCurrency(Number(req.amount))}</p>
                                            <Badge className={cn("text-[10px] font-black border-none uppercase tracking-widest h-6 px-2.5", s.classes)}>{s.label}</Badge>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Platform Alerts — derived from overview */}
            {(!overviewLoading && alerts.length > 0) && (
                <Card className="border-none shadow-sm rounded-[32px] bg-orange-50 border border-orange-100">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle size={20} className="text-orange-500" />
                            <h2 className="text-lg font-black text-orange-900">Platform Alerts</h2>
                        </div>
                        <div className="space-y-3">
                            {alerts.map((alert, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/70 border border-orange-100">
                                    <span className="size-5 rounded-full bg-orange-100 text-orange-500 font-black text-[10px] flex items-center justify-center shrink-0 mt-px">{i + 1}</span>
                                    <p className="text-sm font-medium text-orange-800">{alert}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
