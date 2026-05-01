"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, User, FileText, CheckCircle2, XCircle,
    Banknote, Clock, MapPin, Briefcase, Shield, AlertTriangle, Building, CreditCard, Activity, CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    PENDING: { label: "Pending", classes: "bg-orange-50 text-orange-600", icon: <Clock size={14} /> },
    APPROVED: { label: "Approved", classes: "bg-green-50 text-green-600", icon: <CheckCircle2 size={14} /> },
    FUNDED: { label: "Funded", classes: "bg-blue-50 text-blue-600", icon: <Banknote size={14} /> },
    REJECTED: { label: "Rejected", classes: "bg-red-50 text-red-600", icon: <XCircle size={14} /> },
};

export default function AdminRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: requestApp, isLoading } = useQuery({
        queryKey: ["application", id],
        queryFn: async () => {
            const res = await fetch(`/api/applications/${id}`);
            if (!res.ok) throw new Error("Failed to fetch application");
            return res.json();
        },
    });
    const request = requestApp?.application ?? null;
    console.log(request)
    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            const res = await fetch(`/api/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["application", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status");
        }
    });

    const fundMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/applications/${id}/fund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Funding transfer failed");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Funding transfer initiated successfully!");
            queryClient.invalidateQueries({ queryKey: ["application", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Funding transfer failed");
        }
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
                </div>
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-12 w-96 rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-[24px]" />
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-black text-[#1F4941]">Application Not Found</h2>
                <p className="text-gray-500 mt-2">This application doesn't exist or has been removed.</p>
                <Button className="mt-6" asChild>
                    <Link href="/admin/requests">Back to Requests</Link>
                </Button>
            </div>
        );
    }

    const s = statusConfig[request.status] || { label: request.status, classes: "bg-gray-100 text-gray-500", icon: <Clock size={14} /> };
    const borrower = request.borrower || {};
    const lender = request.loanApp?.merchant || {};
    const bankDetails = request.bankDetails || {};

    // Complex Credit Entities Extraction
    const creditEntity = borrower.creditReport?.entity || {};
    const reportScore = creditEntity.score || {};
    const ficoScoreData = borrower.creditScore?.entity?.score?.ficoScore || null;

    const totalBorrowedC = (reportScore.totalBorrowed || []).reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
    const totalOutstandingC = (reportScore.totalOutstanding || []).reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
    const totalLoansC = (reportScore.totalNoOfLoans || []).reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
    const totalOverdueC = (reportScore.totalOverdue || []).reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);

    const loanHistoryArrays = (reportScore.loanHistory || []).map((lh: any) => lh.value || []).flat();

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-xl hover:bg-gray-100" asChild>
                        <Link href="/admin/requests"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-[#1F4941] tracking-tight">Application <span className="text-gray-300">#{id.slice(0, 8)}</span></h1>
                            <Badge className={cn("text-xs font-black border-none uppercase tracking-widest px-3 py-1 gap-1.5 rounded-lg", s.classes)}>
                                {s.icon} {s.label}
                            </Badge>
                        </div>
                        <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                            <CalendarDays size={14} /> Submitted on {format(new Date(request.createdAt), "MMMM d, yyyy")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {request.status === "PENDING" && (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-6"
                                onClick={() => updateStatusMutation.mutate("REJECTED")}
                                disabled={updateStatusMutation.isPending}
                            >
                                <XCircle className="mr-2" size={16} /> Reject
                            </Button>
                            <Button
                                className="flex-1 md:flex-none bg-[#1F4941] text-[#BDF49D] hover:bg-[#15342e] rounded-xl px-6 shadow-md shadow-[#1F4941]/20"
                                onClick={() => updateStatusMutation.mutate("APPROVED")}
                                disabled={updateStatusMutation.isPending}
                            >
                                <CheckCircle2 className="mr-2" size={16} /> Approve
                            </Button>
                        </>
                    )}
                    {request.status === "APPROVED" && (
                        <Button
                            className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 rounded-xl px-8"
                            onClick={() => fundMutation.mutate()}
                            disabled={fundMutation.isPending}
                        >
                            {fundMutation.isPending ? "Initiating..." : <><Banknote className="mr-2" size={18} /> Initiate Funding</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* Top Cards Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Card className="border-none shadow-sm rounded-[24px] bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Banknote size={12} /> Requested Amount</p>
                        <p className="text-3xl font-black text-[#1F4941] mt-2">{formatCurrency(request.amount)}</p>
                        <Badge variant="secondary" className="mt-3 bg-gray-50 text-gray-600 font-bold border-none">{request.durationMonths} Months Duration</Badge>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[24px] bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><User size={12} /> Borrower</p>
                        <p className="text-xl font-bold text-[#1F4941] truncate mt-2">{borrower.firstName} {borrower.lastName}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1 truncate">{borrower.email}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[24px] bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Building size={12} /> Lender / App</p>
                        <p className="text-xl font-bold text-[#1F4941] truncate mt-2">{request.loanApp?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">Status: {request.loanApp?.isActive ? 'Active' : 'Inactive'}</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[24px] bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-[#1F4941] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Activity size={12} /> Risk Assessment</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className={cn("text-3xl font-black", ficoScoreData?.score >= 600 ? "text-green-600" : "text-orange-500")}>
                                {ficoScoreData?.score || "N/A"}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{ficoScoreData?.rating || "Pending"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for detailed info */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-gray-100 p-1.5 rounded-2xl mb-8 inline-flex flex-wrap w-full md:w-auto h-auto justify-start max-w-full overflow-x-auto gap-2">
                    <TabsTrigger value="overview" className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#1F4941] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        <FileText className="mr-2 shrink-0" size={16} /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="borrower" className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#1F4941] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        <User className="mr-2 shrink-0" size={16} /> Profile Details
                    </TabsTrigger>
                    <TabsTrigger value="credit" className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#1F4941] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        <Shield className="mr-2 shrink-0" size={16} /> Deep Credit Report
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-[#1F4941] data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        <Briefcase className="mr-2 shrink-0" size={16} /> Loan History ({loanHistoryArrays.length})
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-50/80 px-8 py-5">
                                <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-[#1F4941]/70" /> Application Specifics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    <DetailRow label="Application ID" value={<span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{request.id}</span>} />
                                    <DetailRow label="Principal Amount" value={formatCurrency(request.amount)} />
                                    <DetailRow label="Duration" value={`${request.durationMonths} Months`} />
                                    <DetailRow label="Repayment Plan" value={request.repaymentPlan?.name || "N/A"} />
                                    <DetailRow label="Interest Rate" value={`${request.repaymentPlan?.interestRate || 0}%`} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-50/80 px-8 py-5">
                                <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={16} className="text-[#1F4941]/70" /> Disbursement Bank
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {borrower.bankAccounts && borrower.bankAccounts.length > 0 ? (
                                        borrower.bankAccounts.map((acc: any, i: number) => (
                                            <div key={i}>
                                                <DetailRow label="Bank Name" value={acc.bankName} />
                                                <DetailRow label="Account Name" value={acc.accountName} />
                                                <DetailRow label="Account Number" value={<span className="tracking-wider">{acc.accountNumber}</span>} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-gray-400 italic">No bank details found for this borrower.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* BORROWER PROFILE TAB */}
                <TabsContent value="borrower" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5">
                                <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                    <User size={16} className="text-[#1F4941]/70" /> Identity Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    <DetailRow label="Full Name" value={`${borrower.firstName} ${borrower.middleName || ''} ${borrower.lastName}`} />
                                    <DetailRow label="Email Address" value={borrower.email} />
                                    <DetailRow label="Phone Number" value={borrower.phone || "—"} />
                                    <DetailRow label="Gender" value={borrower.gender || "—"} />
                                    <DetailRow label="Date of Birth" value={borrower.dob ? format(new Date(borrower.dob), "PPP") : "—"} />
                                    <DetailRow label="BVN" value={<span className="font-mono tracking-widest">{borrower.bvn || "—"}</span>} />
                                    <DetailRow label="KYC Status" value={<Badge variant="outline" className={borrower.kycVerified ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-500"}>{borrower.kycVerified ? "Verified" : "Pending"}</Badge>} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5">
                                    <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                        <Briefcase size={16} className="text-[#1F4941]/70" /> Employment & Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-50">
                                        <DetailRow label="Employment Type" value={borrower.employmentType || "—"} />
                                        <DetailRow label="Monthly Income Range" value={borrower.monthlyIncome || "—"} />
                                        <DetailRow label="Address" value={<span className="text-right inline-block max-w-[250px] truncate">{borrower.address || "—"}</span>} />
                                        <DetailRow label="City & State" value={`${borrower.city || ''}, ${borrower.state || ''}`.replace(/^, |^,$/, '') || "—"} />
                                    </div>
                                </CardContent>
                            </Card>

                            {borrower.documents && borrower.documents.length > 0 && (
                                <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                                    <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5">
                                        <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                            <Shield size={16} className="text-[#1F4941]/70" /> KYC Documents
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 grid grid-cols-2 gap-4">
                                        {borrower.documents.map((doc: any, i: number) => (
                                            <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="block border border-gray-100 bg-gray-50 rounded-xl p-4 hover:border-[#1F4941]/30 transition-colors">
                                                <p className="text-xs font-bold text-gray-500 mb-2">{doc.type}</p>
                                                <div className="h-24 bg-gray-200 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${doc.url})` }} />
                                            </a>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* DEEP CREDIT REPORT TAB */}
                <TabsContent value="credit" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden h-fit">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5">
                                <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={16} className="text-[#1F4941]/70" /> Structural FICO Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    <DetailRow label="FICO Score" value={
                                        <span className={cn("font-black text-xl", ficoScoreData?.score >= 600 ? "text-green-600" : "text-orange-500")}>
                                            {ficoScoreData?.score || "N/A"}
                                        </span>
                                    } />
                                    <DetailRow label="Classification" value={
                                        <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50 font-black">{ficoScoreData?.rating || "N/A"}</Badge>
                                    } />

                                    {ficoScoreData?.reasons && (
                                        <div className="p-6 bg-red-50/50">
                                            <p className="text-xs font-black text-red-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                <AlertTriangle size={14} className="text-red-600" /> Negative Risk Elements
                                            </p>
                                            <ul className="text-sm text-red-700/80 leading-relaxed font-medium space-y-2 list-disc pl-4">
                                                {ficoScoreData.reasons.split('. ').filter(Boolean).map((reason: string, i: number) => (
                                                    <li key={i}>{reason.trim()}.</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5">
                                    <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={16} className="text-[#1F4941]/70" /> Aggregated Financials
                                    </CardTitle>
                                    <CardDescription className="text-xs">Consolidated metrics across all connected bureaus</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-50">
                                        <DetailRow label="Total Value Borrowed" value={
                                            <span className="font-bold text-gray-800">{formatCurrency(totalBorrowedC)}</span>
                                        } />
                                        <DetailRow label="Total Outstanding Balance" value={
                                            <span className="font-bold text-[#1F4941]">{formatCurrency(totalOutstandingC)}</span>
                                        } />
                                        <DetailRow label="Total Amount Overdue" value={
                                            <span className={cn("font-bold", totalOverdueC > 0 ? "text-red-500" : "text-green-600")}>
                                                {formatCurrency(totalOverdueC)}
                                            </span>
                                        } />
                                        <DetailRow label="Total Associated Loans" value={totalLoansC.toString()} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-50 px-8 py-5 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest">
                                        Recent Credit Enquiries
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                                    <div className="divide-y divide-gray-50">
                                        {reportScore.creditEnquiries?.flatMap((enq: any) => enq.value || []).slice(0, 10).map((enquiry: any, i: number) => (
                                            <div key={i} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-gray-800">{enquiry.loanProvider || enquiry.institutionType || "Unknown"}</span>
                                                    <span className="text-xs font-medium text-gray-500">{enquiry.date ? format(new Date(enquiry.date), 'MMM d, yyyy') : '—'}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{enquiry.reason || enquiry.loanType || "Credit Enquiry"}</p>
                                            </div>
                                        )) || <div className="p-6 text-center text-sm text-gray-400">No recent enquiries</div>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* LOAN HISTORY TAB */}
                <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-500">
                    <Card className="border-none shadow-sm rounded-[24px] bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-50/80 px-8 py-6">
                            <CardTitle className="text-sm font-black text-[#1F4941] uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={16} className="text-[#1F4941]/70" /> Comprehensive Loan Record
                            </CardTitle>
                            <CardDescription className="text-xs font-medium mt-1">Detailed history extracted from credit registry sources</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loanHistoryArrays.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <tr>
                                                <th className="px-8 py-4">Institution</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Outstanding</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Disbursed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loanHistoryArrays.map((loan: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-4 font-bold text-[#1F4941] whitespace-nowrap">{loan.loanProvider}</td>
                                                    <td className="px-6 py-4 text-gray-600 font-medium">{loan.type || loan.purpose || "Loan"}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {loan.currency === 'NGN' ? '₦ ' : ''}
                                                        {loan.loanAmount?.toLocaleString() || "0"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "font-bold",
                                                            parseFloat(loan.outstandingBalance?.toString()?.replace(/,/g, '') || '0') > 0 ? "text-orange-600" : "text-green-600"
                                                        )}>
                                                            {loan.currency === 'NGN' ? '₦ ' : ''}
                                                            {loan.outstandingBalance?.toLocaleString() || "0"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={cn(
                                                            "font-black tracking-wider text-[10px] uppercase",
                                                            loan.performanceStatus?.toLowerCase().includes('performing') ? "border-green-200 text-green-700 bg-green-50" :
                                                                loan.performanceStatus?.toLowerCase().includes('closed') || loan.status === 'Closed' ? "border-gray-200 text-gray-600 bg-gray-50" :
                                                                    "border-red-200 text-red-700 bg-red-50"
                                                        )}>
                                                            {loan.performanceStatus || loan.status || "Unknown"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400 font-medium text-xs whitespace-nowrap">
                                                        {loan.disbursedDate || "N/A"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-16 flex flex-col items-center justify-center">
                                    <Briefcase size={48} className="text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-medium">No extended loan history found on bureaus.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center px-8 py-4 hover:bg-gray-50/40 transition-colors group">
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{label}</span>
            <span className="text-sm font-bold text-[#1F4941] text-right">{value}</span>
        </div>
    );
}

