"use client";

import { CheckCircle2, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function TabTrigger({
    value,
    icon,
    label,
}: {
    value: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <TabsTrigger
            value={value}
            className="flex-1 rounded-[24px] data-[state=active]:bg-lemon-primary data-[state=active]:text-main-green data-[state=active]:shadow-lg h-full gap-2 transition-all font-black text-xs uppercase tracking-wider text-gray-400 group"
        >
            <span className="group-data-[state=active]:scale-110 transition-transform">
                {icon}
            </span>
            <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
    );
}

export function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                    {label}
                </p>
                <p className="text-sm font-bold text-main-green truncate">{value}</p>
            </div>
        </div>
    );
}

export function TimelineStep({
    status,
    label,
    date,
    isFirst,
    isLast,
}: {
    status: "completed" | "current" | "upcoming";
    label: string;
    date?: string;
    isFirst?: boolean;
    isLast?: boolean;
}) {
    return (
        <div className={cn("flex items-center relative", !isLast && "flex-1")}>
            <div className="flex flex-col items-center z-10">
                <div
                    className={cn(
                        "size-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm",
                        status === "completed" && "bg-lemon-primary text-main-green",
                        status === "current" && "bg-main-green text-white",
                        status === "upcoming" && "bg-gray-100 text-gray-300",
                    )}
                >
                    {status === "completed" && <CheckCircle2 size={12} />}
                </div>
                <div className="absolute top-8 text-center whitespace-nowrap">
                    <p
                        className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            status === "upcoming" ? "text-gray-300" : "text-main-green",
                        )}
                    >
                        {label}
                    </p>
                    {date && <p className="text-[9px] font-bold text-gray-400">{date}</p>}
                </div>
            </div>
            {!isLast && (
                <div
                    className={cn(
                        "h-[2px] w-full mx-1",
                        status === "completed" ? "bg-lemon-primary" : "bg-gray-100",
                    )}
                />
            )}
        </div>
    );
}

export function VerificationItem({
    label,
    status,
}: {
    label: string;
    status: "Verified" | "Pending" | "Failed";
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-50">
            <span className="text-sm font-bold text-gray-600">{label}</span>
            <Badge
                className={cn(
                    "font-black text-[9px] border-none uppercase tracking-widest",
                    status === "Verified"
                        ? "bg-green-50 text-green-600"
                        : status === "Pending"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600",
                )}
            >
                {status}
            </Badge>
        </div>
    );
}

export function DocumentCard({
    title,
    type,
    status,
    url,
}: {
    title: string;
    type: string;
    status: string;
    url?: string;
}) {
    const isUploaded = status !== "Not Uploaded";

    return (
        <Card className={cn(
            "border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-md transition-all",
            !isUploaded && "opacity-70 bg-gray-50/50"
        )}>
            <div className={cn(
                "h-24 flex items-center justify-center relative transition-colors",
                isUploaded ? "bg-gray-50 group-hover:bg-lemon-primary/5" : "bg-gray-100/30"
            )}>
                <FileText
                    size={40}
                    className={cn(
                        "transition-colors",
                        isUploaded ? "text-gray-200 group-hover:text-lemon-primary" : "text-gray-100"
                    )}
                />
                <Badge className={cn(
                    "absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest border-none px-2.5 py-1 whitespace-nowrap",
                    status === "Verified" ? "bg-green-50 text-green-600" :
                        status === "Pending" ? "bg-orange-50 text-orange-600" :
                            status === "Not Uploaded" ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-600"
                )}>
                    {status}
                </Badge>
            </div>
            <CardContent className="p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                    {title}
                </p>
                <p className="text-sm font-bold text-main-green mb-4 truncate">{type}</p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl font-black h-9 text-[10px] uppercase tracking-wider"
                        disabled={!isUploaded || !url}
                        asChild={isUploaded && !!url}
                    >
                        {isUploaded && url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                View
                            </a>
                        ) : (
                            <span>View</span>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 bg-gray-50 rounded-xl text-gray-400 hover:text-main-green transition-colors"
                        disabled={!isUploaded || !url}
                        asChild={isUploaded && !!url}
                    >
                        {isUploaded && url ? (
                            <a href={url} download>
                                <Download size={14} />
                            </a>
                        ) : (
                            <Download size={14} />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function ActivityItem({
    title,
    time,
    desc,
}: {
    title: string;
    time: string;
    desc: string;
}) {
    return (
        <div className="relative pl-8">
            <div className="absolute left-0 top-1.5 size-6 rounded-full border-4 border-white bg-lemon-primary text-main-green flex items-center justify-center z-10 shadow-sm">
                <CheckCircle2 size={10} />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-main-green">{title}</h5>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {time}
                    </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
