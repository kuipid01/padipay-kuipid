import { db } from "@/db";
import { loanApplications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { desc } from "drizzle-orm";
import { ApplicationsList } from "@/components/dashboard/applications-list";

export default async function ApplicationsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    // Fetch applications for all apps owned by this user
    const applications = await db.query.loanApplications.findMany({
        with: {
            loanApp: true,
            borrower: true,
        },
        orderBy: [desc(loanApplications.createdAt)],
    });

    // Filter applications where owner is current user
    const userApplications = applications.filter(app => app.loanApp.ownerId === userId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">Loan Applications</h1>
                <p className="text-gray-500 font-medium">Scan, filter, and review incoming borrower requests with ease.</p>
            </div>

            <ApplicationsList initialApplications={userApplications} />
        </div>
    );
}
