
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Users,
    CreditCard,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoanApp } from "@/hooks/user/loan-apps";
import { PageHeader } from "@/components/ui/page-header";

type LoanApplication = {
    id: string;
    loanAppId: string;
    borrowerId: string;
    amount: string;
    durationMonths: number;
    interestRate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    borrower?: {
        fullName: string;
        email: string;
        phone: string;
    };
};

type LoanAppResponse = {
    loanApp?: LoanApp;
    app?: LoanApp;
    data?: LoanApp;
    applications?: LoanApplication[];
    loanApplications?: LoanApplication[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(value);

export default function AppDetailsPage() {
    const params = useParams<{ appId: string }>();
    const router = useRouter();
    const appId = params?.appId;
    const [app, setApp] = useState<LoanApp | null>(null);
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appId) return;
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        fetch(`/api/loan-apps/${appId}`)
            .then(async (res) => {
                const data = (await res.json()) as LoanAppResponse | LoanApp;
                if (!res.ok) {
                    const message = (data as { error?: string })?.error || "Failed to fetch loan app";
                    throw new Error(message);
                }
                return data;
            })
            .then((data) => {
                if (!isMounted) return;
                const payload = data as LoanAppResponse;
                const appData = payload.loanApp ?? payload.app ?? payload.data ?? (data as LoanApp);
                if (!appData?.id) {
                    setError("Loan app not found.");
                    return;
                }
                const appsList =
                    (Array.isArray(payload.applications) && payload.applications) ||
                    (Array.isArray(payload.loanApplications) && payload.loanApplications) ||
                    (Array.isArray((appData as any).applications) && (appData as any).applications) ||
                    [];
                setApp(appData);
                setApplications(appsList);
            })
            .catch((err: Error) => {
                if (!isMounted) return;
                setError(err.message);
            })
            .finally(() => {
                if (!isMounted) return;
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [appId]);
    const stats = useMemo(() => {
        const total = applications.length;
        const approved = applications.filter((item) => item.status === "APPROVED").length;
        const rejected = applications.filter((item) => item.status === "REJECTED").length;
        const totalDisbursed = applications
            .filter((item) => item.status === "APPROVED")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return [
            { label: "Total Applications", value: total.toString(), icon: <Users size={20} className="text-blue-500" />, color: "bg-blue-50" },
            { label: "Approved Loans", value: approved.toString(), icon: <CheckCircle2 size={20} className="text-green-500" />, color: "bg-green-50" },
            { label: "Rejected", value: rejected.toString(), icon: <XCircle size={20} className="text-red-500" />, color: "bg-red-50" },
            { label: "Total Disbursed", value: formatCurrency(totalDisbursed), icon: <CreditCard size={20} className="text-violet-500" />, color: "bg-violet-50" },
        ];
    }, [applications]);

    const recentApplications = useMemo(() => {
        const sorted = [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return sorted.slice(0, 5);
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return recentApplications;
        return recentApplications.filter((item) =>
            item.id.toLowerCase().includes(query) ||
            item.borrowerId.toLowerCase().includes(query) ||
            item.borrower?.fullName?.toLowerCase().includes(query) ||
            item.borrower?.email?.toLowerCase().includes(query)
        );
    }, [recentApplications, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-8 w-64 rounded-lg bg-gray-100 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-sm rounded-[24px]">
                            <CardContent className="p-6">
                                <div className="h-3 w-24 bg-gray-100 rounded-full mb-3 animate-pulse" />
                                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="space-y-6">
                <p className="text-sm font-bold text-red-500">{error || "Unable to load this loan app."}</p>
                <Button variant="outline" className="border-gray-100 rounded-2xl font-bold h-11" onClick={() => router.push("/dashboard/apps")}>
                    Back to Apps
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={
                    <div className="flex items-center gap-2">
                        {app.name}
                        <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-none px-3 h-6", app.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
                            {app.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                }
                description={
                    <>
                        Overview and management for <span className="font-black text-main-green">{app.slug}</span>
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" className="border-gray-100 rounded-2xl font-bold h-11" asChild>
                            <Link href={`/dashboard/apps/${appId}/settings`}>Settings</Link>
                        </Button>
                        <Button className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black rounded-2xl h-11 shadow-lg shadow-lemon-primary/20" asChild>
                            <Link href={`/dashboard/apps/${appId}/analytics`}>Analytics</Link>
                        </Button>
                    </>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden rounded-[24px]">
                        <CardContent className="p-6 flex flex-col justify-between relative">
                            <div className={cn("absolute top-0 right-0 m-4 w-fit h-fit opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:opacity-50", stat.color)}>
                                {stat.icon}
                            </div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-main-green">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Applications */}
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-main-green">Recent Applications</CardTitle>
                        <p className="text-sm font-medium text-gray-400 mt-1">Latest loan requests from this app</p>
                    </div>
                    <Button variant="ghost" className="text-main-green font-bold text-xs uppercase tracking-widest gap-2">
                        View All <ArrowUpRight size={16} />
                    </Button>
                </CardHeader>
                <CardContent className="p-8">
                    {/* Filters mockup */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search applicants..."
                                className="pl-10 rounded-xl bg-gray-50 border-gray-100 h-10 font-bold"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 font-bold text-gray-500 gap-2 h-10">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {filteredApplications.length === 0 ? (
                            <div className="p-6 text-center text-sm font-bold text-gray-400">
                                No recent applications found.
                            </div>
                        ) : filteredApplications.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-main-green/10 flex items-center justify-center font-black text-main-green">
                                        {(item.borrower?.fullName || item.borrowerId).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-main-green group-hover:text-primary transition-colors">
                                            {item.borrower?.fullName || "Unknown Borrower"}
                                        </p>
                                        <p className="text-xs text-gray-400 font-bold">{item.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-main-green">{formatCurrency(Number(item.amount || 0))}</p>
                                    <Badge className={cn(
                                        "capitalize font-bold border-none text-[10px] h-5 mt-1",
                                        item.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            item.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                "bg-orange-100 text-orange-700"
                                    )}>
                                        {item.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Repayment Plans */}
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-main-green">Repayment Plans</CardTitle>
                        <p className="text-sm font-medium text-gray-400 mt-1">Terms available for this loan app</p>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {app.repaymentPlans.length === 0 ? (
                        <div className="p-6 text-center text-sm font-bold text-gray-400">
                            No repayment plans available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {app.repaymentPlans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className="rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-black text-main-green">{plan.name}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {plan.durationDays} Days • {plan.creditTier} Tier
                                            </p>
                                        </div>
                                        {plan.isDefault && (
                                            <Badge className="bg-lemon-primary/40 text-main-green border-none text-[10px] font-black uppercase tracking-widest">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold text-gray-500">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Interest</p>
                                            <p className="text-sm text-main-green">{plan.interestRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Late Fee</p>
                                            <p className="text-sm text-main-green">{plan.lateFeesPercentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Grace Period</p>
                                            <p className="text-sm text-main-green">{plan.gracePeriodDays} Days</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Early Repay</p>
                                            <p className="text-sm text-main-green">
                                                {plan.earlyRepaymentAllowed ? `${plan.earlyRepaymentDiscount ?? 0}%` : "Not Allowed"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Badge className={cn(
                                            "text-[10px] font-black uppercase tracking-widest border-none",
                                            plan.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {plan.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
