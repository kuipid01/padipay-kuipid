"use client";

import { Search, Users, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useAdminBorrowers, useAdminOverview } from "@/hooks/admin";
import { Skeleton } from "@/components/ui/skeleton";

const statusClasses: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-600",
    INACTIVE: "bg-gray-100 text-gray-500",
    DEFAULTED: "bg-red-50 text-red-600",
};

const scoreColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 700) return "text-green-600";
    if (score >= 580) return "text-orange-500";
    return "text-red-500";
};

export default function AdminBorrowersPage() {
    const [search, setSearch] = useState("");

    const { data: overview } = useAdminOverview();
    const { data, isLoading } = useAdminBorrowers({ search: search || undefined, limit: 50 });

    const borrowers = data?.borrowers ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs font-black text-[#1F4941]/40 uppercase tracking-widest mb-1">Admin</p>
                <h1 className="text-3xl font-black text-[#1F4941]">Borrowers</h1>
                <p className="text-gray-500 font-medium mt-1">View and monitor all registered borrowers on the platform.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: "Total Borrowers", value: overview?.totalBorrowers ?? "—", icon: Users, color: "bg-blue-50 text-blue-500" },
                    { label: "Active", value: borrowers.filter(b => b.status === "ACTIVE").length || "—", icon: CheckCircle2, color: "bg-green-50 text-green-500" },
                    { label: "Defaulted", value: borrowers.filter(b => b.status === "DEFAULTED").length || "—", icon: XCircle, color: "bg-red-50 text-red-500" },
                ].map((card) => (
                    <Card key={card.label} className="border-none shadow-sm rounded-[24px] bg-white">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center", card.color)}>
                                <card.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                                <p className="text-2xl font-black text-[#1F4941]">{card.value.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                    placeholder="Search name, email, location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 border-gray-100 rounded-2xl bg-white shadow-sm"
                />
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-8 py-4 border-b border-gray-50 bg-gray-50/50">
                        {["Borrower", "Location", "Total Loans", "Total Borrowed", "Credit Score", "Status"].map((h) => (
                            <p key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</p>
                        ))}
                    </div>
                    <div className="divide-y divide-gray-50">
                        {isLoading
                            ? Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-8 py-5 items-center">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-9 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3.5 w-28" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                    </div>
                                    {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-3.5 w-16" />)}
                                </div>
                            ))
                            : borrowers.map((b) => {
                                const fullName = `${b.firstName} ${b.lastName}`;
                                return (
                                    <div key={b.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-8 py-5 items-center hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 rounded-full bg-[#1F4941]/10 text-[#1F4941] font-black text-sm flex items-center justify-center shrink-0">
                                                {fullName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-[#1F4941] text-sm truncate">{fullName}</p>
                                                <p className="text-[11px] text-gray-400 truncate">{b.email}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">{b.state ?? "—"}</p>
                                        <p className="font-bold text-[#1F4941] text-sm text-center">{b.totalLoans}</p>
                                        <p className="font-black text-[#1F4941] text-sm">{formatCurrency(b.totalBorrowedNGN)}</p>
                                        <p className={cn("font-black text-sm", scoreColor(b.creditScore))}>{b.creditScore ?? "—"}</p>
                                        <Badge className={cn("text-[10px] font-black border-none uppercase tracking-widest h-6 px-2.5", statusClasses[b.status])}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                );
                            })}
                    </div>
                    {!isLoading && total > 0 && (
                        <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/30">
                            <p className="text-xs font-bold text-gray-400">Showing {borrowers.length} of {total} borrowers</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
