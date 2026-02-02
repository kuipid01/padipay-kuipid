
import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    ArrowLeft,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppAnalyticsPageProps {
    params: Promise<{ appId: string }>;
}

export default async function AppAnalyticsPage({ params }: AppAnalyticsPageProps) {
    const { appId } = await params;
    const session = await getSession();
    const userId = session?.id as string;

    const app = await db.query.loanApps.findFirst({
        where: and(
            eq(loanApps.id, appId),
            eq(loanApps.ownerId, userId)
        ),
    });

    if (!app) {
        notFound();
    }

    // Mock Data
    const performanceMetrics = [
        { label: "Approval Rate", value: "68%", trend: "+2.4%", trendUp: true },
        { label: "Default Rate", value: "4.2%", trend: "-0.5%", trendUp: true }, // Lower default is "good" (green)
        { label: "Avg. Duration", value: "4.5 mo", trend: "+0.2", trendUp: true },
        { label: "CAC", value: "₦1,200", trend: "-₦50", trendUp: true },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-4">
                <Button variant="ghost" size="sm" className="w-fit text-gray-500 hover:text-main-green -ml-4" asChild>
                    <Link href={`/dashboard/apps/${appId}`}>
                        <ArrowLeft size={16} className="mr-2" /> Back to App
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-main-green tracking-tight">Analytics</h1>
                        <p className="text-gray-500 font-medium">Performance insights for <span className="font-black text-main-green">{app.name}</span></p>
                    </div>
                    <Button variant="outline" className="border-gray-100 rounded-2xl font-bold gap-2">
                        <Calendar size={16} /> Last 30 Days
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceMetrics.map((metric, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[24px]">
                        <CardContent className="p-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{metric.label}</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-black text-main-green">{metric.value}</h3>
                                <Badge className={cn(
                                    "font-bold border-none",
                                    metric.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                    {metric.trend} {metric.trendUp ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mock Chart Area 1 */}
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardHeader className="p-8 pb-2">
                        <CardTitle className="text-lg font-black text-main-green">Application Volume</CardTitle>
                        <p className="text-sm text-gray-400 font-medium">Daily loan requests</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 h-[300px] flex items-end gap-2 justify-between">
                        {/* Simple CSS Bar Chart Mockup */}
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="flex-1 w-full bg-lemon-primary/20 rounded-t-lg relative group transition-all hover:bg-lemon-primary/50" style={{ height: `${Math.random() * 80 + 20}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {Math.floor(Math.random() * 50)} apps
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Mock Chart Area 2 */}
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardHeader className="p-8 pb-2">
                        <CardTitle className="text-lg font-black text-main-green">Disbursement vs Repayment</CardTitle>
                        <p className="text-sm text-gray-400 font-medium">Cash flow analysis</p>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 h-[300px] flex items-end gap-3 justify-center">
                        <div className="relative size-60 rounded-full border-[20px] border-gray-100 border-t-main-green border-r-lemon-primary flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Flow</p>
                                <p className="text-3xl font-black text-main-green">+12.5%</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-4 ml-8">
                            <div>
                                <p className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-1">
                                    <div className="size-3 rounded-full bg-main-green" /> Disbursed
                                </p>
                                <p className="font-black text-lg pl-5 text-gray-800">₦12.4M</p>
                            </div>
                            <div>
                                <p className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-1">
                                    <div className="size-3 rounded-full bg-lemon-primary" /> Repaid
                                </p>
                                <p className="font-black text-lg pl-5 text-gray-800">₦8.2M</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Export Section */}
            <Card className="bg-main-green text-white border-none shadow-lg rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black mb-2">Export Data</h3>
                        <p className="text-white/60 font-medium max-w-md">Download comprehensive reports including loan performance, applicant demographics, and financial statements.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button className="bg-white text-main-green hover:bg-gray-50 font-black h-12 px-8 rounded-2xl shadow-lg border-none">
                            <Download size={18} className="mr-2" /> Download CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
