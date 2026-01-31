import { db } from "@/db";
import { loans, borrowers, repayments } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Calendar, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { RepaymentChargeButton } from "@/components/dashboard/repayment-charge-button";
import { Progress } from "@/components/ui/progress";

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.id as string;

    const loan = await db.query.loans.findFirst({
        where: eq(loans.id, id),
        with: {
            borrower: true,
        }
    });

    if (!loan || loan.lenderId !== userId) {
        notFound();
    }

    const loanRepayments = await db.query.repayments.findMany({
        where: eq(repayments.loanId, id),
        orderBy: [asc(repayments.dueDate)],
    });

    const totalPaid = loanRepayments
        .filter(r => r.status === "PAID")
        .reduce((acc, r) => acc + parseFloat(r.amount.toString()), 0);

    const totalAmount = parseFloat(loan.totalPayable.toString());
    const progressPercent = (totalPaid / totalAmount) * 100;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/loans"><ArrowLeft size={20} /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Loan Details</h1>
                </div>
                <Badge variant={loan.status === "ACTIVE" ? "default" : "secondary"}>{loan.status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Stats & Borrower Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Borrower</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-muted"><User size={20} /></div>
                                <div className="font-semibold">{loan.borrower.fullName}</div>
                            </div>
                            <div className="mt-4 pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground italic">Phone</span>
                                    <span>{loan.borrower.phone}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground italic">Email</span>
                                    <span className="truncate ml-2">{loan.borrower.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Repayment Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="text-2xl font-bold">₦{totalPaid.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">of ₦{totalAmount.toLocaleString()}</div>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                            <div className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-semibold">
                                {Math.round(progressPercent)}% Collected
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Repayment Schedule */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Repayment Schedule</CardTitle>
                            <CardDescription>Installments and payment status.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loanRepayments.map((rep, idx) => (
                                        <TableRow key={rep.id}>
                                            <TableCell className="pl-6 font-medium">
                                                <div className="text-xs text-muted-foreground mb-0.5">Installment {idx + 1}</div>
                                                {format(new Date(rep.dueDate), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell>₦{parseFloat(rep.amount.toString()).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={rep.status === "PAID" ? "default" : rep.status === "FAILED" ? "destructive" : "outline"}>
                                                    {rep.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                {rep.status !== "PAID" && (
                                                    <RepaymentChargeButton
                                                        repaymentId={rep.id}
                                                        amount={rep.amount.toString()}
                                                    />
                                                )}
                                                {rep.status === "PAID" && rep.paidAt && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Paid {format(new Date(rep.paidAt), "MMM d")}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
