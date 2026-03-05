"use client";

import { useState, useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
    Search,
    Filter,
    Mail,
    MessageSquare,
    Send,
    Inbox,
    RefreshCw,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationSummary {
    totalSent: number;
    emails: number;
    sms: number;
    thisWeek: number;
}

interface NotificationLog {
    id: string;
    category: string;
    channel: "EMAIL" | "SMS";
    status: string;
    createdAt: string;
    borrower: {
        firstName: string | null;
        lastName: string | null;
    } | null;
}

interface HistoryResponse {
    data: NotificationLog[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}

const CATEGORY_LABELS: Record<string, string> = {
    'PRE_DUE_3_DAYS': 'Repayment Reminder (3 days)',
    'PRE_DUE_1_DAY': 'Repayment Reminder (1 day)',
    'OVERDUE': 'Late Payment Alert',
    'PAYMENT_CONFIRMATION': 'Payment Received',
    'LOAN_APPROVED': 'Loan Approval Notification',
    'LOAN_DISBURSED': 'Fund Disbursement Alert',
};

const CATEGORY_COLORS: Record<string, string> = {
    'PRE_DUE_3_DAYS': 'bg-blue-50 text-blue-600',
    'PRE_DUE_1_DAY': 'bg-amber-50 text-amber-600',
    'OVERDUE': 'bg-red-50 text-red-600',
    'PAYMENT_CONFIRMATION': 'bg-green-50 text-green-600',
    'LOAN_APPROVED': 'bg-violet-50 text-violet-600',
    'LOAN_DISBURSED': 'bg-emerald-50 text-emerald-600',
};

export function NotificationsList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [channelFilter, setChannelFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    // Fetch Summary Stats
    const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery<NotificationSummary>({
        queryKey: ["notifications", "summary"],
        queryFn: async () => {
            const res = await fetch("/api/notifications/lender/summary");
            if (!res.ok) throw new Error("Failed to fetch summary");
            return res.json();
        }
    });

    // Fetch History with Infinite Scroll
    const {
        data: historyData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isHistoryLoading,
        refetch: refetchHistory
    } = useInfiniteQuery<HistoryResponse>({
        queryKey: ["notifications", "history", channelFilter, statusFilter, searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: (pageParam as number).toString(),
                limit: "10"
            });
            if (channelFilter.length === 1) params.append("channel", channelFilter[0]);
            if (statusFilter.length === 1) params.append("status", statusFilter[0]);
            // Search is handled client-side in this simple version, but we could add server-side search if backend supported it

            const res = await fetch(`/api/notifications/lender/history?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json();
        },
        getNextPageParam: (lastPage) => {
            const next = lastPage.meta.page + 1;
            return next <= Math.ceil(lastPage.meta.total / lastPage.meta.limit) ? next : undefined;
        },
        initialPageParam: 1
    });

    const notifications = useMemo(() => {
        const all = historyData?.pages.flatMap(page => page.data) || [];
        if (!searchQuery) return all;
        const q = searchQuery.toLowerCase();
        return all.filter(n =>
            n.borrower?.firstName?.toLowerCase().includes(q) ||
            n.borrower?.lastName?.toLowerCase().includes(q) ||
            CATEGORY_LABELS[n.category]?.toLowerCase().includes(q)
        );
    }, [historyData, searchQuery]);

    const handleRefresh = () => {
        refetchSummary();
        refetchHistory();
    };

    // Grouping for the UI
    const groupedNotifications = useMemo(() => {
        return notifications.reduce((groups, notif) => {
            const date = format(new Date(notif.createdAt), "yyyy-MM-dd");
            if (!groups[date]) groups[date] = [];
            groups[date].push(notif);
            return groups;
        }, {} as Record<string, NotificationLog[]>);
    }, [notifications]);

    const sortedDates = Object.keys(groupedNotifications).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) return "Today";
        if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Yesterday";
        return format(date, "EEEE, MMMM d");
    };

    return (
        <div className="space-y-10">
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Messages"
                    value={summary?.totalSent || 0}
                    icon={<Send size={24} />}
                    color="blue"
                    isLoading={isSummaryLoading}
                />
                <StatCard
                    label="Email Delivery"
                    value={summary?.emails || 0}
                    icon={<Mail size={24} />}
                    color="violet"
                    isLoading={isSummaryLoading}
                />
                <StatCard
                    label="SMS Alerts"
                    value={summary?.sms || 0}
                    icon={<MessageSquare size={24} />}
                    color="emerald"
                    isLoading={isSummaryLoading}
                />
                <StatCard
                    label="Active This Week"
                    value={summary?.thisWeek || 0}
                    icon={<Clock size={24} />}
                    color="orange"
                    isLoading={isSummaryLoading}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        placeholder="Search by borrower or message..."
                        className="pl-12 h-14 bg-white border-transparent rounded-[24px] focus-visible:ring-main-green/20 focus-visible:border-main-green shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-14 border-gray-100 rounded-[24px] gap-3 font-bold px-6 bg-white hover:bg-gray-50 transition-all shadow-sm">
                                <Filter size={18} className="text-gray-500" />
                                <span className="text-gray-700">Filters</span>
                                {(channelFilter.length > 0 || statusFilter.length > 0) && (
                                    <Badge className="bg-main-green text-white rounded-full px-2 h-6 min-w-6 flex items-center justify-center">
                                        {channelFilter.length + statusFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-6 rounded-[32px] shadow-2xl border-gray-100 bg-white/95 backdrop-blur-xl" align="end">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Channel</p>
                                    <div className="space-y-3">
                                        {[
                                            { key: "EMAIL", label: "Email", icon: <Mail size={14} /> },
                                            { key: "SMS", label: "SMS", icon: <MessageSquare size={14} /> }
                                        ].map(type => (
                                            <div key={type.key} className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                                                if (channelFilter.includes(type.key)) setChannelFilter(channelFilter.filter(t => t !== type.key));
                                                else setChannelFilter([...channelFilter, type.key]);
                                            }}>
                                                <Checkbox
                                                    id={`chan-${type.key}`}
                                                    checked={channelFilter.includes(type.key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setChannelFilter([...channelFilter, type.key]);
                                                        else setChannelFilter(channelFilter.filter(t => t !== type.key));
                                                    }}
                                                />
                                                <label className="text-sm font-bold text-gray-600 group-hover:text-main-green transition-colors flex items-center gap-2 cursor-pointer">
                                                    {type.icon} {type.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Status</p>
                                    <div className="space-y-3">
                                        {[
                                            { key: "SENT", label: "Delivered", icon: <CheckCircle2 size={14} className="text-green-500" /> },
                                            { key: "FAILED", label: "Failed", icon: <XCircle size={14} className="text-red-500" /> },
                                            { key: "PENDING", label: "In Queue", icon: <Clock size={14} className="text-blue-500" /> }
                                        ].map(s => (
                                            <div key={s.key} className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                                                if (statusFilter.includes(s.key)) setStatusFilter(statusFilter.filter(t => t !== s.key));
                                                else setStatusFilter([...statusFilter, s.key]);
                                            }}>
                                                <Checkbox
                                                    id={`stat-${s.key}`}
                                                    checked={statusFilter.includes(s.key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setStatusFilter([...statusFilter, s.key]);
                                                        else setStatusFilter(statusFilter.filter(t => t !== s.key));
                                                    }}
                                                />
                                                <label className="text-sm font-bold text-gray-600 group-hover:text-main-green transition-colors flex items-center gap-2 cursor-pointer">
                                                    {s.icon} {s.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-black text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                    onClick={() => {
                                        setChannelFilter([]);
                                        setStatusFilter([]);
                                    }}
                                >
                                    Reset all filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="h-14 border-gray-100 rounded-[24px] gap-3 font-bold px-6 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={18} className={cn("text-gray-500", (isHistoryLoading || isSummaryLoading) && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-8">
                {isHistoryLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-gray-50 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-[40px] bg-white/50 backdrop-blur-sm border border-gray-50">
                        <CardContent className="p-20">
                            <div className="flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="size-24 rounded-full bg-main-green/5 flex items-center justify-center text-main-green/20 mb-6"
                                >
                                    <Inbox size={48} />
                                </motion.div>
                                <h3 className="font-black text-gray-800 text-2xl mb-3">No activity found</h3>
                                <p className="text-gray-500 max-w-sm font-medium">
                                    We couldn't find any notifications matching your current filters.
                                </p>
                                <Button
                                    variant="link"
                                    className="mt-6 text-main-green font-bold"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setChannelFilter([]);
                                        setStatusFilter([]);
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-12">
                        {sortedDates.map((dateStr, dateIdx) => (
                            <motion.div
                                key={dateStr}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dateIdx * 0.1 }}
                            >
                                <div className="flex items-center gap-6 mb-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                        {getDateLabel(dateStr)}
                                    </h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent" />
                                    <Badge variant="secondary" className="bg-gray-100/50 text-gray-400 text-[10px] font-bold border-none px-3 py-1 rounded-full">
                                        {groupedNotifications[dateStr].length} messages
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {groupedNotifications[dateStr].map((notif) => (
                                            <NotificationRow key={notif.id} notification={notif} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}

                        {hasNextPage && (
                            <div className="flex justify-center pt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="h-14 rounded-[24px] px-10 font-bold border-gray-100 hover:bg-gray-50 gap-3"
                                >
                                    {isFetchingNextPage ? <Loader2 className="animate-spin" size={18} /> : <ChevronDown size={18} />}
                                    Load more history
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function NotificationRow({ notification }: { notification: NotificationLog }) {
    const isEmail = notification.channel === "EMAIL";
    const status = notification.status;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group"
        >
            <Card className="border-none shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 rounded-[32px] overflow-hidden bg-white border border-transparent hover:border-gray-50">
                <div className="flex">
                    <div className={cn(
                        "w-1.5 shrink-0 transition-colors duration-500",
                        isEmail ? "bg-violet-400" : "bg-emerald-400",
                        status === 'FAILED' && "bg-red-400"
                    )} />

                    <CardContent className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Status Icon */}
                        <div className={cn(
                            "size-14 rounded-3xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                            isEmail ? "bg-violet-50 text-violet-500" : "bg-emerald-50 text-emerald-500",
                            status === 'FAILED' && "bg-red-50 text-red-500"
                        )}>
                            {isEmail ? <Mail size={24} /> : <MessageSquare size={24} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="text-sm font-black text-gray-800">
                                        {notification.borrower ? `${notification.borrower.firstName} ${notification.borrower.lastName}` : "System User"}
                                    </span>
                                </div>
                                <div className="size-1 rounded-full bg-gray-200" />
                                <Badge className={cn(
                                    "font-black text-[10px] border-none uppercase tracking-widest px-3 h-6 rounded-full",
                                    CATEGORY_COLORS[notification.category] || "bg-gray-100 text-gray-600"
                                )}>
                                    {CATEGORY_LABELS[notification.category] || notification.category}
                                </Badge>
                                <div className="size-1 rounded-full bg-gray-200" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {format(new Date(notification.createdAt), "h:mm a")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm font-medium leading-relaxed">
                                    Automated {notification.channel.toLowerCase()} message successfully {status.toLowerCase()} to recipient.
                                </span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                            <Badge variant="outline" className={cn(
                                "rounded-xl px-4 py-1.5 font-bold border-2 transition-colors",
                                status === 'SENT' && "bg-green-50/50 border-green-100 text-green-600",
                                status === 'FAILED' && "bg-red-50/50 border-red-100 text-red-600",
                                status === 'PENDING' && "bg-blue-50/50 border-blue-100 text-blue-600"
                            )}>
                                {status}
                            </Badge>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </motion.div>
    );
}

function StatCard({ label, value, icon, color, isLoading }: { label: string; value: number; icon: React.ReactNode; color: 'blue' | 'violet' | 'emerald' | 'orange'; isLoading?: boolean }) {
    const variants = {
        blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100/50", shadow: "group-hover:shadow-blue-200/40" },
        violet: { bg: "bg-violet-50", icon: "text-violet-500", border: "border-violet-100/50", shadow: "group-hover:shadow-violet-200/40" },
        emerald: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100/50", shadow: "group-hover:shadow-emerald-200/40" },
        orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100/50", shadow: "group-hover:shadow-orange-200/40" },
    };

    const style = variants[color];

    return (
        <Card className={cn(
            "border shadow-sm transition-all duration-500 group overflow-hidden rounded-[36px] bg-white",
            style.border,
            style.shadow,
            "hover:-translate-y-1 hover:shadow-xl"
        )}>
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("size-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", style.bg, style.icon)}>
                        {icon}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">{label}</p>
                    {isLoading ? (
                        <div className="h-10 w-24 bg-gray-50 animate-pulse rounded-lg" />
                    ) : (
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                            {value.toLocaleString()}
                        </h3>
                    )}
                </div>

                {/* Decorative background circle */}
                <div className={cn("absolute -right-8 -bottom-8 size-32 rounded-full opacity-[0.03] transition-transform duration-1000 group-hover:scale-150", style.bg)} />
            </CardContent>
        </Card>
    );
}
