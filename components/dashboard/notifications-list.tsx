"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Mail,
    MessageSquare,
    Bell,
    BellRing,
    CheckCircle2,
    Clock,
    Send,
    Inbox,
    MailOpen,
    Smartphone,
    AlertCircle,
    Trash2,
    MoreHorizontal,
    RefreshCw
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: string | null;
    message: string;
    sentAt: string;
}

interface NotificationsListProps {
    initialNotifications: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string[]>([]);

    const filteredNotifications = initialNotifications.filter(notif => {
        const matchesSearch = notif.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter.length === 0 || (notif.type && typeFilter.includes(notif.type));
        return matchesSearch && matchesType;
    });

    const emailCount = initialNotifications.filter(n => n.type === "EMAIL").length;
    const smsCount = initialNotifications.filter(n => n.type === "SMS").length;

    // Group notifications by date
    const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
        const date = format(new Date(notif.sentAt), "yyyy-MM-dd");
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(notif);
        return groups;
    }, {} as Record<string, Notification[]>);

    const sortedDates = Object.keys(groupedNotifications).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
            return "Today";
        } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
            return "Yesterday";
        }
        return format(date, "EEEE, MMMM d");
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Sent"
                    value={initialNotifications.length.toString()}
                    icon={<Send className="text-blue-500" size={20} />}
                    trend="All time"
                    color="bg-blue-50"
                />
                <StatCard
                    label="Emails"
                    value={emailCount.toString()}
                    icon={<Mail className="text-violet-500" size={20} />}
                    trend="Email notifications"
                    color="bg-violet-50"
                />
                <StatCard
                    label="SMS"
                    value={smsCount.toString()}
                    icon={<Smartphone className="text-green-500" size={20} />}
                    trend="Text messages"
                    color="bg-green-50"
                />
                <StatCard
                    label="This Week"
                    value={initialNotifications.filter(n => {
                        const sentDate = new Date(n.sentAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return sentDate >= weekAgo;
                    }).length.toString()}
                    icon={<Clock className="text-orange-500" size={20} />}
                    trend="Recent activity"
                    color="bg-orange-50"
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        placeholder="Search notifications..."
                        className="pl-12 h-12 bg-white border-gray-100 rounded-2xl focus-visible:ring-main-green shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-12 border-gray-100 rounded-2xl gap-2 font-bold px-6 bg-white shadow-sm">
                                <Filter size={18} /> Filters
                                {typeFilter.length > 0 && (
                                    <Badge className="bg-main-green text-white rounded-full px-1.5 h-5 min-w-5">
                                        {typeFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-gray-100" align="end">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Type</p>
                                    <div className="space-y-2">
                                        {[{ key: "EMAIL", label: "Email", icon: <Mail size={14} /> }, { key: "SMS", label: "SMS", icon: <Smartphone size={14} /> }].map(type => (
                                            <div key={type.key} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`type-${type.key}`}
                                                    checked={typeFilter.includes(type.key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setTypeFilter([...typeFilter, type.key]);
                                                        else setTypeFilter(typeFilter.filter(t => t !== type.key));
                                                    }}
                                                />
                                                <label htmlFor={`type-${type.key}`} className="text-sm font-bold text-gray-600 cursor-pointer flex items-center gap-2">
                                                    {type.icon} {type.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-bold text-red-500 hover:text-red-600 p-0 h-8"
                                    onClick={() => setTypeFilter([])}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" className="h-12 border-gray-100 rounded-2xl gap-2 font-bold px-6 bg-white shadow-sm">
                        <RefreshCw size={18} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="size-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                                <Inbox size={40} />
                            </div>
                            <p className="font-black text-gray-400 text-xl mb-2">No notifications yet</p>
                            <p className="text-gray-400 max-w-sm">Notifications will appear here when you or your borrowers receive automated messages.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(dateStr => (
                        <div key={dateStr}>
                            {/* Date Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                    {getDateLabel(dateStr)}
                                </h3>
                                <div className="flex-1 h-px bg-gray-100" />
                                <Badge variant="secondary" className="bg-gray-50 text-gray-400 text-[10px] font-bold border-none">
                                    {groupedNotifications[dateStr].length} messages
                                </Badge>
                            </div>

                            {/* Notifications for this date */}
                            <div className="space-y-3">
                                {groupedNotifications[dateStr].map((notif) => (
                                    <NotificationCard key={notif.id} notification={notif} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function NotificationCard({ notification }: { notification: Notification }) {
    const isEmail = notification.type === "EMAIL";

    return (
        <Card className="border-none shadow-sm rounded-[24px] hover:shadow-md transition-all group overflow-hidden">
            <div className="flex">
                {/* Color Stripe */}
                <div className={cn(
                    "w-1 shrink-0",
                    isEmail ? "bg-violet-500" : "bg-green-500"
                )} />

                <CardContent className="flex-1 p-5 flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                        "size-11 rounded-2xl flex items-center justify-center shrink-0",
                        isEmail ? "bg-violet-50 text-violet-500" : "bg-green-50 text-green-500"
                    )}>
                        {isEmail ? <Mail size={20} /> : <MessageSquare size={20} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className={cn(
                                "font-black text-[9px] border-none uppercase tracking-widest h-6 px-2.5",
                                isEmail ? "bg-violet-50 text-violet-600" : "bg-green-50 text-green-600"
                            )}>
                                {notification.type}
                            </Badge>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-main-green leading-relaxed line-clamp-2">
                            {notification.message}
                        </p>
                    </div>

                    {/* Time & Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-bold text-gray-400">
                            {format(new Date(notification.sentAt), "h:mm a")}
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 rounded-xl text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontal size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-2xl p-2 shadow-xl border-gray-100 font-bold">
                                <DropdownMenuItem className="rounded-xl px-4 py-2.5 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer">
                                    <MailOpen size={14} className="mr-2" /> View Full
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl px-4 py-2.5 text-sm focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer">
                                    <Trash2 size={14} className="mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

function StatCard({ label, value, icon, trend, color }: { label: string; value: string; icon: React.ReactNode; trend: string; color: string }) {
    return (
        <Card className="border-main-green/10 shadow-sm hover:shadow-md transition-shadow group overflow-hidden rounded-[24px]">
            <CardContent className="p-6 flex flex-col justify-between relative">
                <div className={cn("absolute top-0 right-0 m-4 w-fit h-fit opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:opacity-50", color)}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-black text-main-green">{value}</h3>
                <div className="mt-3">
                    <Badge variant="secondary" className="bg-gray-50 text-gray-500 text-[10px] font-bold border-none">
                        {trend}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
