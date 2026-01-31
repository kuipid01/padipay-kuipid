import { db } from "@/db";
import { loanApps, loans } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Link as LinkIcon, Users, CreditCard, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userApps = await db.query.loanApps.findMany({
        where: eq(loanApps.ownerId, userId),
        orderBy: (loanApps, { desc }) => [desc(loanApps.createdAt)],
    });

    // Basic stats (mocking some for UI)
    const totalApps = userApps.length;
    const activeLoans = 0; // Will be actual query later
    const totalRepayments = 0; // Will be actual query later

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Loan Apps" value={totalApps} icon={<CreditCard className="text-blue-500" />} />
                <StatCard title="Active Loans" value={activeLoans} icon={<Users className="text-green-500" />} />
                <StatCard title="Total Collected" value="₦0.00" icon={<TrendingUp className="text-violet-500" />} />
                <StatCard title="Pending Applications" value="0" icon={<LinkIcon className="text-orange-500" />} />
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Your Loan Apps</h2>
                {userApps.length > 0 && (
                    <Button size="sm" asChild>
                        <Link href="/dashboard/apps/new"><Plus size={18} className="mr-1" /> New App</Link>
                    </Button>
                )}
            </div>

            {userApps.length === 0 ? (
                <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <CreditCard size={40} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Loan Apps Yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Create your first loan application link to start receiving loan requests from borrowers.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/apps/new">
                            <Plus size={18} className="mr-2" /> Create My First App
                        </Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userApps.map((app) => (
                        <Card key={app.id} className="hover:shadow-md transition-shadow overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                        <CreditCard className="text-primary" size={24} />
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${app.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {app.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>
                                <CardTitle className="mt-4">{app.name}</CardTitle>
                                <p className="text-sm text-muted-foreground truncate">
                                    {process.env.NEXT_PUBLIC_APP_URL || "padi-loan"}/{app.slug}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                    <div className="text-muted-foreground">
                                        Interest: <span className="text-foreground">{app.defaultInterestRate}%</span>
                                    </div>
                                    <div className="text-muted-foreground text-right">
                                        Duration: <span className="text-foreground">{app.defaultDurationMonths}mo</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/dashboard/apps/${app.id}`}>Manage</Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" title="Copy Link" asChild>
                                        <a href={`/loan/${app.slug}`} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon size={18} />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-4 w-4">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
