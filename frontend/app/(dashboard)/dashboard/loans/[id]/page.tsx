"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Loader2, AlertCircle, Phone, Mail, MapPin, ShieldCheck, Wallet, TrendingUp, CalendarClock, ShieldAlert, CreditCard } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { RepaymentChargeButton } from "@/components/dashboard/repayment-charge-button";
import { Progress } from "@/components/ui/progress";
import { useFetch } from "@/hooks/general";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoanDetailPage() {
    const params = useParams<{ id: string }>();

    const { data: loan, isLoading } = useFetch<any>(
        `/api/loans/${params.id}`,
    );
    console.log(loan, "loan")
    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div>
                            <Skeleton className="h-8 w-40 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>

                {/* Top Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <Card className="shadow-sm border-gray-200/60 overflow-hidden">
                        <CardHeader className="pb-3 bg-gray-50/50 flex flex-row items-center justify-between border-b border-gray-100">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <div className="flex items-center gap-4 mb-5">
                                <Skeleton className="h-14 w-14 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2 */}
                    <Card className="shadow-sm border-gray-200/60 overflow-hidden">
                        <CardHeader className="pb-3 bg-gray-50/50 flex flex-row items-center justify-between border-b border-gray-100">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <div className="mb-5 space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-8 w-40" />
                            </div>
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-8 w-full rounded-md" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3 */}
                    <Card className="shadow-sm border-gray-200/60 overflow-hidden">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent className="pt-5 space-y-4">
                            <div className="mb-3 space-y-2">
                                <Skeleton className="h-8 w-full" />
                            </div>
                            <Skeleton className="h-3.5 w-full rounded-full" />
                            <div className="flex justify-end mt-2.5">
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <Skeleton className="h-16 w-full rounded-xl" />
                                <Skeleton className="h-16 w-full rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Skeleton */}
                <Card className="shadow-sm border-gray-200/60">
                    <CardHeader className="border-b border-gray-100 bg-white">
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="pl-6 h-12 w-1/4"><Skeleton className="h-4 w-32" /></TableHead>
                                    <TableHead className="w-1/4"><Skeleton className="h-4 w-20" /></TableHead>
                                    <TableHead className="w-1/4"><Skeleton className="h-4 w-16" /></TableHead>
                                    <TableHead className="w-1/4 text-right pr-6"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!loan || loan.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="p-6 rounded-full bg-red-50 border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">
                        Loan Not Found
                    </h2>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                        The loan you are looking for does not exist or you don't have permission to view it.
                    </p>
                </div>
                <Button
                    className="bg-main-green hover:bg-main-green/90 text-white font-bold"
                    asChild
                >
                    <Link href="/dashboard/loans">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Loans
                    </Link>
                </Button>
            </div>
        );
    }

    const loanRepayments = (loan.repayments || []).sort((a: any, b: any) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const totalPaid = loanRepayments
        .filter((r: any) => r.status === "PAID")
        .reduce((acc: number, r: any) => acc + parseFloat(r.amount.toString()), 0);

    const totalAmount = parseFloat(loan.totalPayable?.toString() || "0");
    const principalAmount = parseFloat(loan.principal?.toString() || "0");
    const interestAmount = parseFloat(loan.interest?.toString() || "0");
    const progressPercent = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

    const borrowerName = loan.borrower?.fullName || [loan.borrower?.firstName, loan.borrower?.lastName].filter(Boolean).join(" ") || "Unknown Borrower";
    const borrowerLocation = [loan.borrower?.city, loan.borrower?.state, loan.borrower?.country].filter(Boolean).join(", ") || "No address provided";

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="rounded-full">
                        <Link href="/dashboard/loans"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Loan Details</h1>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            ID: <span className="font-mono text-gray-600 truncate max-w-[120px]">{loan.id}</span>
                        </div>
                    </div>
                </div>
                <Badge
                    className="px-4 py-1.5 text-sm uppercase tracking-wider font-bold"
                    variant={loan.status === "ACTIVE" ? "default" : loan.status === "DEFAULTED" ? "destructive" : "secondary"}
                >
                    {loan.status}
                </Badge>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Borrower Profile Card */}
                <Card className="shadow-sm border-gray-200/60 overflow-hidden">
                    <CardHeader className="pb-3 bg-gray-50/50 flex flex-row items-center justify-between border-b border-gray-100">
                        <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Borrower Profile</CardTitle>
                        <User className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-14 w-14 rounded-full bg-main-green/10 flex items-center justify-center text-main-green font-bold text-xl ring-4 ring-main-green/5">
                                {borrowerName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-lg text-gray-900 leading-tight mb-1">{borrowerName}</div>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    {loan.borrower?.kycVerified ? (
                                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                                            <ShieldCheck className="h-3 w-3" /> KYC Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200">
                                            <ShieldAlert className="h-3 w-3" /> Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3.5 pt-4 border-t border-gray-100 text-sm">
                            <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{loan.borrower?.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="font-medium truncate">{loan.borrower?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-600 hover:text-gray-900 transition-colors">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                <span className="font-medium leading-tight">{borrowerLocation}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Loan Summary Card */}
                <Card className="shadow-sm border-gray-200/60 overflow-hidden">
                    <CardHeader className="pb-3 bg-gray-50/50 flex flex-row items-center justify-between border-b border-gray-100">
                        <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Loan Summary</CardTitle>
                        <Wallet className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="mb-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Principal Amount</div>
                            <div className="text-3xl font-black text-gray-900 tracking-tight">
                                ₦{principalAmount.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-3.5 pt-4 border-t border-gray-100 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-2 font-medium">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" /> Interest
                                </span>
                                <span className="font-bold text-gray-900">₦{interestAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 -mx-2 bg-gray-50 rounded-md">
                                <span className="text-gray-700 flex items-center gap-2 font-bold">
                                    <Wallet className="h-4 w-4 text-main-green" /> Total Payable
                                </span>
                                <span className="font-black text-main-green">₦{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-2 font-medium">
                                    <CalendarClock className="h-4 w-4 text-blue-500" /> Start Date
                                </span>
                                <span className="font-bold text-gray-900">{loan.startDate ? format(new Date(loan.startDate), "MMM d, yyyy") : "N/A"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Collection Progress Card */}
                <Card className="shadow-sm border-main-green/20 overflow-hidden bg-gradient-to-br from-main-green/[0.03] to-transparent relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <CreditCard className="w-32 h-32" />
                    </div>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-main-green/10">
                        <CardTitle className="text-sm font-bold text-main-green uppercase tracking-wider">Collection Progress</CardTitle>
                        <CreditCard className="h-4 w-4 text-main-green" />
                    </CardHeader>
                    <CardContent className="pt-5 relative z-10 space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recovered</div>
                                    <div className="text-3xl font-black text-main-green tracking-tight">₦{totalPaid.toLocaleString()}</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target</div>
                                    <div className="text-xl font-bold text-gray-400">₦{totalAmount.toLocaleString()}</div>
                                </div>
                            </div>

                            <Progress

                                value={progressPercent}
                                className="h-3.5 bg-main-green/10 shrink-0"
                            />

                            <div className="mt-2.5 text-xs font-black text-right text-main-green uppercase tracking-widest">
                                {progressPercent.toFixed(1)}% Completed
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-main-green/10">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-main-green/5">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending</div>
                                <div className="font-black text-gray-700 text-lg leading-none">₦{Math.max(0, totalAmount - totalPaid).toLocaleString()}</div>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-main-green/5">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Installments</div>
                                <div className="font-black text-gray-700 text-lg leading-none">
                                    <span className="text-main-green">{loanRepayments.filter((r: any) => r.status === "PAID").length}</span>
                                    <span className="text-gray-300 mx-1">/</span>
                                    <span className="">{loanRepayments.length}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Repayment Schedule */}
            <Card className="shadow-sm border-gray-200/60 lg:col-span-3">
                <CardHeader className="border-b border-gray-100 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Repayment Schedule</CardTitle>
                            <CardDescription className="mt-1">Track expected installments and payment statuses.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="pl-6 h-12 font-bold text-gray-600">Installment & Due Date</TableHead>
                                <TableHead className="font-bold text-gray-600">Amount</TableHead>
                                <TableHead className="font-bold text-gray-600">Status</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-gray-600">Action & Tracking</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loanRepayments.map((rep: any, idx: number) => (
                                <TableRow key={rep.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {rep.dueDate ? format(new Date(rep.dueDate), "MMM d, yyyy") : "N/A"}
                                                </div>
                                                <div className="text-xs font-medium text-gray-500 mt-0.5">
                                                    {rep.dueDate ? format(new Date(rep.dueDate), "h:mm a") : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">
                                            ₦{parseFloat(rep.amount.toString()).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider"
                                            variant={rep.status === "PAID" ? "default" : rep.status === "FAILED" ? "destructive" : "outline"}
                                        >
                                            {rep.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <div className="flex flex-col items-end gap-2">
                                            {rep.status !== "PAID" && (
                                                <RepaymentChargeButton
                                                    repaymentId={rep.id}
                                                    amount={rep.amount.toString()}
                                                />
                                            )}
                                            {rep.status === "PAID" && rep.paidAt && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Paid {format(new Date(rep.paidAt), "MMM d, yyyy")}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loanRepayments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="font-medium text-sm">No repayment schedule available yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
