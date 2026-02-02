
import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
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

interface AppDetailsPageProps {
    params: Promise<{ appId: string }>;
}

export default async function AppDetailsPage({ params }: AppDetailsPageProps) {
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

    // Mock Data for this specific app
    const stats = [
        { label: "Total Applications", value: "156", icon: <Users size={20} className="text-blue-500" />, color: "bg-blue-50" },
        { label: "Approved Loans", value: "89", icon: <CheckCircle2 size={20} className="text-green-500" />, color: "bg-green-50" },
        { label: "Rejected", value: "24", icon: <XCircle size={20} className="text-red-500" />, color: "bg-red-50" },
        { label: "Total Disbursed", value: "₦4.2M", icon: <CreditCard size={20} className="text-violet-500" />, color: "bg-violet-50" },
    ];

    const recentApplications = [
        { id: "APP-001", name: "John Doe", amount: "₦50,000", date: "2 mins ago", status: "Pending" },
        { id: "APP-002", name: "Sarah Smith", amount: "₦150,000", date: "1 hour ago", status: "Approved" },
        { id: "APP-003", name: "Michael Brown", amount: "₦30,000", date: "3 hours ago", status: "Rejected" },
        { id: "APP-004", name: "Emily Davis", amount: "₦500,000", date: "1 day ago", status: "Pending" },
        { id: "APP-005", name: "Chris Wilson", amount: "₦75,000", date: "2 days ago", status: "Approved" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-4xl font-black text-main-green tracking-tight">{app.name}</h1>
                        <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-none px-3 h-6", app.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
                            {app.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-gray-500 font-medium">Overview and management for <span className="font-black text-main-green">{app.slug}</span></p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-100 rounded-2xl font-bold h-11" asChild>
                        <Link href={`/dashboard/apps/${appId}/settings`}>Settings</Link>
                    </Button>
                    <Button className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black rounded-2xl h-11 shadow-lg shadow-lemon-primary/20" asChild>
                        <Link href={`/dashboard/apps/${appId}/analytics`}>Analytics</Link>
                    </Button>
                </div>
            </div>

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
                            <Input placeholder="Search applicants..." className="pl-10 rounded-xl bg-gray-50 border-gray-100 h-10 font-bold" />
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 font-bold text-gray-500 gap-2 h-10">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {recentApplications.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-main-green/10 flex items-center justify-center font-black text-main-green">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-main-green group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-xs text-gray-400 font-bold">{item.id} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-main-green">{item.amount}</p>
                                    <Badge className={cn(
                                        "capitalize font-bold border-none text-[10px] h-5 mt-1",
                                        item.status === "Approved" ? "bg-green-100 text-green-700" :
                                            item.status === "Rejected" ? "bg-red-100 text-red-700" :
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
        </div>
    );
}
