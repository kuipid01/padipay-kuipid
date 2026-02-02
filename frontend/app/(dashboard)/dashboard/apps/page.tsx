import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { AppsList } from "@/components/dashboard/apps-list";

export default async function AppsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userApps = await db.query.loanApps.findMany({
        where: eq(loanApps.ownerId, userId),
        orderBy: [desc(loanApps.createdAt)],
    });

    // Transform data for the client component
    const appsWithStats = userApps.map(app => ({
        ...app,
        defaultInterestRate: app.defaultInterestRate.toString(),
        createdAt: app.createdAt?.toISOString() || new Date().toISOString(),
        _count: {
            applications: 0, // This would come from a count query in production
        },
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">Loan Apps</h1>
                <p className="text-gray-500 font-medium">Create and manage your loan application links.</p>
            </div>

            <AppsList initialApps={appsWithStats} />
        </div>
    );
}