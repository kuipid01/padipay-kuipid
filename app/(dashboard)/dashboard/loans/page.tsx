import { db } from "@/db";
import { loans, borrowers, loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default async function LoansPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userLoans = await db.query.loans.findMany({
        where: eq(loans.lenderId, userId),
        with: {
            borrower: true,
            // loanApp is through application, but let's keep it simple for now as we have the lenderId
        },
        orderBy: [desc(loans.startDate)],
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Active Loans</h1>
                <p className="text-muted-foreground">Track repayments and manage your active loan portfolio.</p>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Borrower</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Total Payable</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userLoans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No active loans found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userLoans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell>
                                            <div className="font-medium">{loan.borrower.fullName}</div>
                                        </TableCell>
                                        <TableCell>₦{parseFloat(loan.principal.toString()).toLocaleString()}</TableCell>
                                        <TableCell>₦{parseFloat(loan.totalPayable.toString()).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={loan.status === "ACTIVE" ? "default" : "secondary"}>
                                                {loan.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(loan.startDate!), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/loans/${loan.id}`}>View Schedule</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
