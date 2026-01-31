import { db } from "@/db";
import { loanApplications, borrowers, loanApps, paymentMethods } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Calendar, CreditCard, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ApplicationActions } from "@/components/dashboard/application-actions";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    const userId = session?.id as string;

    const application = await db.query.loanApplications.findFirst({
        where: eq(loanApplications.id, id),
        with: {
            loanApp: true,
            borrower: true,
        }
    });

    if (!application || application.loanApp.ownerId !== userId) {
        notFound();
    }

    // Check if borrower has a linked card
    const card = await db.query.paymentMethods.findFirst({
        where: eq(paymentMethods.borrowerId, application.borrowerId)
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/applications"><ArrowLeft size={20} /></Link>
                </Button>
                <h1 className="text-2xl font-bold">Review Application</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Borrower Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-muted"><User size={20} /></div>
                                <div>
                                    <div className="font-semibold">{application.borrower.fullName}</div>
                                    <div className="text-sm text-muted-foreground">ID: {application.borrower.id.slice(0, 8)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={12} /> Email</div>
                                    <div className="text-sm font-medium">{application.borrower.email}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={12} /> Phone</div>
                                    <div className="text-sm font-medium">{application.borrower.phone}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Requested Amount</div>
                                    <div className="text-2xl font-bold italic">₦{parseFloat(application.amount.toString()).toLocaleString()}</div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="text-xs text-muted-foreground">Duration</div>
                                    <div className="text-2xl font-bold">{application.durationMonths} Months</div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Interest Rate</span>
                                    <span className="font-medium text-orange-600">{application.interestRate}% total</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Submission Date</span>
                                    <span className="font-medium">{format(new Date(application.createdAt!), "PPP")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-primary/20 bg-lemon-primary/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <CreditCard size={14} /> Verification Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Card Authorized</span>
                                <Badge variant={card ? "default" : "destructive"}>{card ? "Yes" : "No"}</Badge>
                            </div>
                            {card && (
                                <div className="text-[10px] text-muted-foreground bg-white p-2 rounded border">
                                    **** **** **** {card.last4} (Expires {card.expiry})
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {application.status === "PENDING" ? (
                        <ApplicationActions applicationId={application.id} />
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-sm text-muted-foreground mb-2">Current Status</div>
                                <Badge variant={application.status === "APPROVED" ? "default" : "destructive"}>{application.status}</Badge>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
