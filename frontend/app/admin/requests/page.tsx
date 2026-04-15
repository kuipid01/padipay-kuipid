"use client";

import { Search, CheckCircle2, XCircle, Clock, Banknote, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useAdminRequests } from "@/hooks/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", classes: "bg-orange-50 text-orange-600", icon: <Clock size={12} /> },
    APPROVED: { label: "Approved", classes: "bg-green-50 text-green-600", icon: <CheckCircle2 size={12} /> },
    FUNDED: { label: "Funded", classes: "bg-blue-50 text-blue-600", icon: <Banknote size={12} /> },
    REJECTED: { label: "Rejected", classes: "bg-red-50 text-red-600", icon: <XCircle size={12} /> },
};

const FILTERS = ["ALL", "PENDING", "APPROVED", "FUNDED", "REJECTED"];

export default function AdminRequestsPage() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("ALL");

    const { data, isLoading } = useAdminRequests({
        status: activeFilter === "ALL" ? undefined : activeFilter,
        search: search || undefined,
        limit: 50,
    });

    const requests = data?.requests ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs font-black text-[#1F4941]/40 uppercase tracking-widest mb-1">Admin</p>
                <h1 className="text-3xl font-black text-[#1F4941]">Funding Requests</h1>
                <p className="text-gray-500 font-medium mt-1">Review, approve, and manage all loan application requests.</p>
            </div>

            {/* Filter Tabs + Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                activeFilter === f
                                    ? "bg-[#1F4941] text-[#BDF49D]"
                                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Search borrower, lender, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 border-gray-100 rounded-2xl bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-8 py-4 border-b border-gray-50 bg-gray-50/50">
                        {["Borrower", "Lender", "Amount", "Duration", "Status", ""].map((h) => (
                            <p key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</p>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-50">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-8 py-5 items-center">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-9 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3.5 w-28" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3.5 w-20" />
                                    <Skeleton className="h-3.5 w-16" />
                                    <Skeleton className="h-3.5 w-14" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="size-8 rounded-xl" />
                                </div>
                            ))
                            : requests.length === 0 ? (
                                <div className="p-16 flex flex-col items-center gap-3 text-center">
                                    <FileText size={36} className="text-gray-200" />
                                    <p className="font-bold text-gray-400">No requests match your filters.</p>
                                </div>
                            ) : requests.map((req) => {
                                const s = statusConfig[req.status];
                                const borrowerName = `${req.borrower.firstName} ${req.borrower.lastName}`;
                                return (
                                    <div key={req.id} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-8 py-5 items-center hover:bg-gray-50/60 transition-colors group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 rounded-full bg-[#1F4941]/10 text-[#1F4941] font-black text-sm flex items-center justify-center shrink-0">
                                                {borrowerName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-[#1F4941] text-sm truncate">{borrowerName}</p>
                                                <p className="text-[11px] text-gray-400 truncate">{req.borrower.email}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-600 text-sm truncate">{req.lender.businessName}</p>
                                        <p className="font-black text-[#1F4941] text-sm">{formatCurrency(Number(req.amount))}</p>
                                        <p className="text-sm text-gray-500 font-medium">{req.durationDays}d</p>
                                        <Badge className={cn("text-[10px] font-black border-none uppercase tracking-widest h-6 px-2.5 gap-1", s.classes)}>
                                            {s.icon} {s.label}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="size-8 rounded-xl text-gray-400 hover:text-[#1F4941] hover:bg-[#BDF49D]/30 opacity-0 group-hover:opacity-100 transition-all" asChild>
                                            <Link href={`/admin/requests/${req.id}`}><ChevronRight size={16} /></Link>
                                        </Button>
                                    </div>
                                );
                            })}
                    </div>

                    {!isLoading && total > 0 && (
                        <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/30">
                            <p className="text-xs font-bold text-gray-400">Showing {requests.length} of {total} results</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
