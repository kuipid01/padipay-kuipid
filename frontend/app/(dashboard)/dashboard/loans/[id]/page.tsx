"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ArrowLeft,
    User,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    ShieldCheck,
    Wallet,
    TrendingUp,
    CalendarClock,
    ShieldAlert,
    CreditCard,
    ChevronRight,
    Download,
    Share2,
    Calendar,
    Clock,
    DollarSign,
    ExternalLink,
    Landmark
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { RepaymentChargeButton } from "@/components/dashboard/repayment-charge-button";
import { Progress } from "@/components/ui/progress";
import { useFetch } from "@/hooks/general";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoanDetailPage() {
    const params = useParams<{ id: string }>();

    const { data: loan, isLoading } = useFetch<any>(
        `/api/loans/${params.id}`,
    );

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Skeleton className="size-12 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded-xl" />
                        <Skeleton className="h-10 w-32 rounded-xl" />
                    </div>
                </div>

                {/* Top Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-none shadow-xl shadow-gray-100/50 rounded-[32px] overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="size-12 rounded-2xl" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-40" />
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Skeleton className="h-[400px] w-full rounded-[40px]" />
            </div>
        );
    }

    if (!loan || loan.error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center"
            >
                <div className="size-24 rounded-[32px] bg-red-50 flex items-center justify-center mb-8 ring-8 ring-red-50/50">
                    <AlertCircle className="size-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Loan Not Found</h2>
                <p className="text-gray-500 max-w-sm mx-auto font-medium mb-10 leading-relaxed">
                    The loan journey you're looking for doesn't exist or might have been restricted.
                </p>
                <Button
                    size="lg"
                    className="bg-main-green hover:bg-main-green/90 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-main-green/20"
                    asChild
                >
                    <Link href="/dashboard/loans">
                        <ArrowLeft className="size-5 mr-3" />
                        Return to Portfolio
                    </Link>
                </Button>
            </motion.div>
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
    const borrowerLocation = [loan.borrower?.city, loan.borrower?.state].filter(Boolean).join(", ") || "Address not set";

    const containerStyle = "max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-10";

    return (
        <div className={containerStyle}>
            {/* Premium Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-5">
                    <Button variant="outline" size="icon" asChild className="size-12 rounded-2xl border-gray-100 shadow-sm hover:bg-main-green hover:text-white transition-all duration-300">
                        <Link href="/dashboard/loans"><ArrowLeft size={20} /></Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Loan Profile</h1>
                            <Badge
                                className={cn(
                                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none h-6 mt-1",
                                    loan.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                                        loan.status === "DEFAULTED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                )}
                            >
                                {loan.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
                            <span className="uppercase tracking-widest text-[10px]">Contract ID:</span>
                            <span className="font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md text-xs">{loan.id}</span>
                        </div>
                    </div>
                </div>
                {/* //TODO:WE ASSIGN THE CONTRACT TO WORKERS , COULD BE COMPNY WORKERS OR PERSONAL WORKERS */}
                {/* <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-gray-100 gap-2 font-black px-6 shadow-sm hover:shadow-md transition-all">
                        <Download size={18} /> Export Contract
                    </Button>
                    <Button className="h-12 rounded-2xl bg-main-green hover:bg-main-green/90 text-white gap-2 font-black px-8 shadow-xl shadow-main-green/20">
                        <Share2 size={18} /> Take Action
                    </Button>
                </div> */}
            </motion.div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. Recipient Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[40px] overflow-hidden group hover:shadow-main-green/5 transition-all duration-500 hover:-translate-y-1">
                        <div className="h-2 bg-main-green w-full" />
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-start justify-between">
                                <div className="size-16 rounded-3xl bg-main-green/10 flex items-center justify-center text-main-green font-black text-2xl group-hover:scale-110 transition-transform duration-500">
                                    {borrowerName.charAt(0)}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <div className={cn("size-2 rounded-full", loan.borrower?.kycVerified ? "bg-emerald-500" : "bg-amber-500")} />
                                        <span className={cn("text-xs font-black uppercase tracking-tighter", loan.borrower?.kycVerified ? "text-emerald-600" : "text-amber-600")}>
                                            {loan.borrower?.kycVerified ? "Verified" : "Action Needed"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-main-green transition-colors">{borrowerName}</h3>
                                <p className="text-sm font-bold text-gray-400 flex items-center gap-1 mt-1">
                                    <MapPin size={12} className="text-main-green" /> {borrowerLocation}
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-main-green/10 group-hover/item:text-main-green transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile</p>
                                        <p className="text-sm font-bold text-gray-700">{loan.borrower?.phone || "Private"}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <ExternalLink size={14} />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/item:bg-main-green/10 group-hover/item:text-main-green transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{loan.borrower?.email || "N/A"}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <ExternalLink size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Portfolio Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[40px] overflow-hidden bg-gray-900 group relative">
                        {/* Decorative Patterns */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                            <div className="absolute -top-10 -right-10 size-40 bg-main-green rounded-full blur-[60px]" />
                            <div className="absolute -bottom-10 -left-10 size-40 bg-blue-500 rounded-full blur-[60px]" />
                        </div>

                        <CardHeader className="p-8 pb-0 relative z-10 flex flex-row items-center justify-between">
                            <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-main-green">
                                <Wallet size={24} />
                            </div>
                            <Badge className="bg-white/10 text-white/50 border-none font-bold uppercase tracking-widest text-[9px]">Loan Meta</Badge>
                        </CardHeader>

                        <CardContent className="p-8 space-y-10 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Deployed Capital</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-white/30 text-2xl font-black">₦</span>
                                    <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter tabular-nums">
                                        {principalAmount.toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[28px] bg-white/5 border border-white/5 group/node hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                        <TrendingUp size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Interest</span>
                                    </div>
                                    <p className="text-lg font-black text-white tabular-nums">₦{interestAmount.toLocaleString()}</p>
                                </div>
                                <div className="p-5 rounded-[28px] bg-white/5 border border-white/5 group/node hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                                        <CalendarClock size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Commenced</span>
                                    </div>
                                    <p className="text-lg font-black text-white uppercase">{loan.startDate ? format(new Date(loan.startDate), "MMM d") : "N/A"}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Gross Receivable</p>
                                    <p className="text-xs font-black text-main-green tabular-nums">₦{totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-main-green to-emerald-400 rounded-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. Real-time Collections */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[40px] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 group">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center justify-between">
                                <div className="size-12 rounded-2xl bg-main-green/10 flex items-center justify-center text-main-green">
                                    <CreditCard size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="bg-main-green/10 text-main-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                                        <div className="size-1.5 bg-main-green rounded-full animate-pulse" />
                                        In Recovery
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recovered Funds</p>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight tabular-nums">₦{totalPaid.toLocaleString()}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-main-green">{progressPercent.toFixed(0)}%</p>
                                    </div>
                                </div>

                                <div className="relative h-6 flex items-center group/progress pt-4 pb-8">
                                    <div className="absolute inset-x-0 h-4 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-main-green relative"
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                                        </motion.div>
                                    </div>
                                    {/* Tick Marks */}
                                    <div className="absolute inset-x-0 h-4 flex justify-between px-2 pt-4">
                                        {[0, 25, 50, 75, 100].map(tick => (
                                            <div key={tick} className="h-full w-0.5 bg-gray-200/50" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Installments</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-gray-900 tabular-nums">{loanRepayments.filter((r: any) => r.status === "PAID").length}</span>
                                        <span className="text-gray-300 font-bold text-lg">/</span>
                                        <span className="text-gray-400 font-bold tabular-nums">{loanRepayments.length}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding</p>
                                    <p className="text-xl font-black text-rose-500 tabular-nums">₦{Math.max(0, totalAmount - totalPaid).toLocaleString()}</p>
                                </div>
                            </div>

                            <Button className="w-full h-14 rounded-2xl bg-gray-50 text-gray-900 border border-gray-100 hover:bg-gray-100 font-black shadow-sm transition-all duration-300 gap-3 group">
                                <Clock size={18} className="text-main-green group-hover:rotate-12 transition-transform" /> Transaction Logs <ChevronRight size={18} className="ml-auto" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Repayment Timeline Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Repayment Schedule</h2>
                        <p className="text-sm font-bold text-gray-400 mt-1">Timeline of expected collections and payment logs.</p>
                    </div>
                </div>

                {/* Table View - Hidden on Mobile */}
                <Card className="hidden lg:block border-none shadow-2xl shadow-gray-200/50 rounded-[40px] overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="pl-10 h-16 font-black text-main-green uppercase text-[10px] tracking-[0.2em]">Batch</TableHead>
                                <TableHead className="h-16 font-black text-main-green uppercase text-[10px] tracking-[0.2em]">Settlement Date</TableHead>
                                <TableHead className="h-16 font-black text-main-green uppercase text-[10px] tracking-[0.2em]">Amount Due</TableHead>
                                <TableHead className="h-16 font-black text-main-green uppercase text-[10px] tracking-[0.2em]">Current Status</TableHead>
                                <TableHead className="text-right pr-10 h-16 font-black text-main-green uppercase text-[10px] tracking-[0.2em]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {loanRepayments.map((rep: any, idx: number) => (
                                    <motion.tr
                                        key={rep.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-gray-50 hover:bg-lemon-primary/5 transition-colors group"
                                    >
                                        <TableCell className="pl-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-main-green group-hover:text-white transition-all duration-300">
                                                    #{idx + 1}
                                                </div>
                                                <div className="font-black text-gray-900">Installment</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{rep.dueDate ? format(new Date(rep.dueDate), "MMM d, yyyy") : "N/A"}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rep.dueDate ? format(new Date(rep.dueDate), "h:mm a") : ""}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-black text-lg text-gray-900 tabular-nums flex items-center gap-1">
                                                <span className="text-xs text-gray-400">₦</span>{parseFloat(rep.amount.toString()).toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none rounded-full",
                                                    rep.status === "PAID" ? "bg-emerald-50 text-emerald-600" :
                                                        rep.status === "FAILED" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                                )}
                                            >
                                                {rep.status === "PAID" ? <ShieldCheck size={12} className="mr-1.5" /> : rep.status === "FAILED" ? <AlertCircle size={12} className="mr-1.5" /> : <Clock size={12} className="mr-1.5" />}
                                                {rep.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-10 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                {rep.status !== "PAID" && (
                                                    <RepaymentChargeButton
                                                        repaymentId={rep.id}
                                                        amount={rep.amount.toString()}
                                                    />
                                                )}
                                                {rep.status === "PAID" && rep.paidAt && (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                        <Calendar size={12} />
                                                        Processed {format(new Date(rep.paidAt), "MMM d")}
                                                    </div>
                                                )}
                                                <Button variant="ghost" size="icon" className="size-10 rounded-xl text-gray-300 hover:text-main-green hover:bg-main-green/10">
                                                    <Download size={18} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </Card>

                {/* Card List - Shown on Mobile/Tablet */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4 pb-12">
                    {loanRepayments.map((rep: any, idx: number) => (
                        <Card key={rep.id} className="border-none shadow-xl shadow-gray-200/50 rounded-[32px] overflow-hidden hover:shadow-main-green/5 transition-all">
                            <CardHeader className="p-6 pb-4 border-b border-gray-50 flex flex-row items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-main-green flex items-center justify-center text-white text-[10px] font-black">
                                        #{idx + 1}
                                    </div>
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Installment</span>
                                </div>
                                <Badge
                                    className={cn(
                                        "px-3 py-1 text-[8px] font-black uppercase tracking-widest border-none",
                                        rep.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                                            rep.status === "FAILED" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                                    )}
                                >
                                    {rep.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <Calendar size={14} className="text-main-green" />
                                            {rep.dueDate ? format(new Date(rep.dueDate), "MMM d, yyyy") : "N/A"}
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Due</p>
                                        <div className="text-xl font-black text-gray-900 tabular-nums">₦{parseFloat(rep.amount.toString()).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                                    {rep.status !== "PAID" ? (
                                        <div className="w-full">
                                            <RepaymentChargeButton
                                                repaymentId={rep.id}
                                                amount={rep.amount.toString()}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-full justify-center">
                                            <ShieldCheck size={14} /> Verified Payment
                                        </div>
                                    )}
                                    <Button variant="outline" size="icon" className="size-11 rounded-xl border-gray-100 shrink-0">
                                        <Download size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {loanRepayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="size-16 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
                            <Landmark size={32} />
                        </div>
                        <p className="text-lg font-black text-gray-400">No scheduled installments yet.</p>
                        <p className="text-sm font-bold text-gray-300 mt-1">Timeline will appear once the loan is fully initialized.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
