import { db } from "@/db";
import { loans } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { LoansList } from "@/components/dashboard/loans-list";

export default async function LoansPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userLoans = await db.query.loans.findMany({
        where: eq(loans.lenderId, userId),
        with: {
            borrower: true,
        },
        orderBy: [desc(loans.startDate)],
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">Active Loans</h1>
                <p className="text-gray-500 font-medium">Track repayments and manage your active loan portfolio.</p>
            </div>

            <LoansList initialLoans={userLoans} />
        </div>
    );
}
