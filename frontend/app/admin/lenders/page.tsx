"use client";

import { Search, Building2, CheckCircle2, AlertTriangle, DollarSign, ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useAdminLenders, useAdminOverview } from "@/hooks/admin";
import { Skeleton } from "@/components/ui/skeleton";

const statusClasses: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-600",
    SUSPENDED: "bg-red-50 text-red-600",
    PENDING_KYC: "bg-orange-50 text-orange-600",
};

const planClasses: Record<string, string> = {
    Starter: "bg-gray-100 text-gray-600",
    Growth: "bg-blue-50 text-blue-600",
    Enterprise: "bg-violet-50 text-violet-600",
};

export default function AdminLendersPage() {
    const [search, setSearch] = useState("");

    const { data: overview } = useAdminOverview();
    const { data, isLoading } = useAdminLenders({ search: search || undefined, limit: 50 });

    const lenders = data?.lenders ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs font-black text-[#1F4941]/40 uppercase tracking-widest mb-1">Admin</p>
                <h1 className="text-3xl font-black text-[#1F4941]">Lenders</h1>
                <p className="text-gray-500 font-medium mt-1">Manage all lenders, their plans, KYC status, and activity.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[
                    { label: "Total Lenders", value: overview?.activeLenders ?? "—", icon: Building2, color: "bg-blue-50 text-blue-500" },
                    { label: "KYC Verified", value: lenders.filter(l => l.kycVerified).length || "—", icon: ShieldCheck, color: "bg-green-50 text-green-500" },
                    { label: "Pending KYC", value: overview?.pendingKycLenders ?? "—", icon: AlertTriangle, color: "bg-orange-50 text-orange-500" },
                    { label: "Total Disbursed", value: overview ? formatCurrency(overview.totalDisbursedNGN) : "—", icon: DollarSign, color: "bg-lemon-primary/20 text-main-green" },
                ].map((card) => (
                    <Card key={card.label} className="border-none shadow-sm rounded-[24px] bg-white">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center", card.color)}>
                                <card.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                                <p className="text-2xl font-black text-[#1F4941]">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                    placeholder="Search lender, owner, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-100 rounded-2xl bg-white shadow-sm"
                />
            </div>

            {/* Lenders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-sm rounded-[28px] bg-white">
                            <CardContent className="p-6 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-11 rounded-2xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-16 rounded-2xl" />
                                    ))}
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                    : lenders.map((lender) => (
                        <Card key={lender.id} className="border-none shadow-sm rounded-[28px] bg-white hover:shadow-md transition-shadow group">
                            <CardContent className="p-6 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-11 rounded-2xl bg-[#1F4941]/10 text-[#1F4941] font-black text-lg flex items-center justify-center">
                                            {lender.businessName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1F4941] text-sm leading-tight">{lender.businessName}</p>
                                            <p className="text-[11px] text-gray-400 font-medium">{lender.ownerName}</p>
                                        </div>
                                    </div>
                                    <Badge className={cn("text-[10px] font-black border-none uppercase tracking-widest h-6 px-2.5", statusClasses[lender.status])}>
                                        {lender.status.replace("_", " ")}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Apps", value: lender.activeApps.toString() },
                                        { label: "Borrowers", value: lender.totalBorrowers.toString() },
                                        { label: "Disbursed", value: formatCurrency(lender.totalDisbursedNGN) },
                                    ].map((s) => (
                                        <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                                            <p className="font-black text-[#1F4941] text-sm">{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn("text-[10px] font-black border-none h-5 px-2", planClasses[lender.plan])}>
                                            {lender.plan}
                                        </Badge>
                                        {lender.kycVerified ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                                <ShieldCheck size={11} /> KYC Verified
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                                                <AlertTriangle size={11} /> KYC Pending
                                            </span>
                                        )}
                                    </div>
                                    <button className="text-[10px] font-bold text-gray-400 hover:text-[#1F4941] flex items-center gap-1 transition-colors">
                                        Details <ChevronRight size={12} />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {!isLoading && total > 0 && (
                <p className="text-xs font-bold text-gray-400 text-center">Showing {lenders.length} of {total} lenders</p>
            )}
        </div>
    );
}
