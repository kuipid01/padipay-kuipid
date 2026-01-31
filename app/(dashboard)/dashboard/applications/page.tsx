import { db } from "@/db";
import { loanApplications, borrowers, loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                    <p className="text-muted-foreground">Manage and review incoming loan requests.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Borrower</TableHead>
                                <TableHead>App</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userApplications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="font-medium">{app.borrower.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{app.borrower.email}</div>
                                        </TableCell>
                                        <TableCell>{app.loanApp.name}</TableCell>
                                        <TableCell>₦{parseFloat(app.amount.toString()).toLocaleString()}</TableCell>
                                        <TableCell>{app.durationMonths} Months</TableCell>
                                        <TableCell>{format(new Date(app.createdAt!), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <Badge variant={app.status === "PENDING" ? "outline" : app.status === "APPROVED" ? "default" : "destructive"}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/applications/${app.id}`}>Review</Link>
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
