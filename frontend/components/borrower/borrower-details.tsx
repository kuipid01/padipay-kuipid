import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Eye,
    CreditCard,
    Calendar,
    ArrowUpRight,
    BadgeCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TabTrigger, InfoRow } from "../dashboard/application-details/shared-components";
import { cn } from "@/lib/utils";
import { Loan, Repayment, } from "../../app/borrower/dashboard/history/page";
import { ApplicationDetails } from "../../app/borrower/dashboard/history/[id]/page";
import { Application } from "../dashboard/application-details/types";

const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
    }).format(Number(amount));
};

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export function LoanApplicationDetails({ application, loan }: Readonly<ApplicationDetails>) {
    return (
        <div className="space-y-8 pb-32">
            <Tabs defaultValue="overview" className="w-full">
                <div className="bg-white p-2 rounded-[32px] shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
                    <TabsList className="bg-transparent h-14 w-full justify-start gap-1">
                        <TabTrigger
                            value="overview"
                            icon={<Eye size={16} />}
                            label="Overview"
                        />
                        <TabTrigger
                            value="repayment"
                            icon={<ShieldCheck size={16} />}
                            label="Repayment"
                        />
                    </TabsList>
                </div>

                <LoanOverview application={application} loan={loan} />
                <RepaymentTabBorrower loan={loan} />
            </Tabs>
        </div>
    );
}

const LoanOverview = ({ application, loan }: { application: Application, loan: Loan }) => {
    const totalPaid = loan?.repayments.reduce((acc, r) => {
        const subTotal = r.subRepayments?.reduce((sAcc, sr) => sAcc + Number(sr.amount), 0) || 0;
        return acc + subTotal;
    }, 0) || 0;

    return (
        <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-[40px] p-2 bg-linear-to-br from-white to-gray-50/50">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-main-green">Loan Summary</h3>
                            <Badge className="bg-main-green text-white font-black uppercase tracking-widest text-[10px] px-3">
                                {loan?.status || application.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <InfoRow
                                icon={<CreditCard size={18} />}
                                label="Borrowed"
                                value={formatCurrency(loan?.principal || application.amount)}
                            />
                            <InfoRow
                                icon={<BadgeCheck size={18} />}
                                label="Total Interest"
                                value={formatCurrency(loan?.interest || "0")}
                            />
                            <InfoRow
                                icon={<ArrowUpRight size={18} />}
                                label="Total Paid"
                                value={formatCurrency(totalPaid)}
                            />
                            <InfoRow
                                icon={<Clock size={18} />}
                                label="Duration"
                                value={`${loan?.repayments?.length || 0} Installments`}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[40px] p-2 bg-white">
                    <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-black text-main-green">Source Details</h3>
                        <div className="space-y-4">
                            <InfoRow
                                icon={<Calendar size={18} />}
                                label="Execution Date"
                                value={formatDate(loan?.startDate || application.createdAt)}
                            />
                            <InfoRow
                                icon={<ShieldCheck size={18} />}
                                label="Loan Application"
                                value={application.loanApp?.name || "Standard Loan"}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
    );
};

const RepaymentCard = ({ item, index }: { item: Repayment; index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasHistory = item.subRepayments && item.subRepayments.length > 0;

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                        item.status === "PAID" ? "bg-green-50 text-green-600" :
                            item.status === "PARTIAL" ? "bg-orange-50 text-orange-600" :
                                "bg-blue-50 text-blue-600"
                    )}>
                        {item.status === "PAID" ? <CheckCircle2 size={24} /> :
                            item.status === "PARTIAL" ? <Clock size={24} /> :
                                <Calendar size={24} />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                            Installment {index + 1}
                        </p>
                        <h4 className="font-black text-main-green text-lg">
                            {formatCurrency(item.amount)}
                        </h4>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 md:gap-12">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Due Date</p>
                        <p className="text-sm font-bold text-gray-600">{formatDate(item.dueDate)}</p>
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                        <Badge className={cn(
                            "font-black text-[9px] border-none uppercase tracking-widest px-3",
                            item.status === "PAID" ? "bg-green-50 text-green-700" :
                                item.status === "PARTIAL" ? "bg-orange-50 text-orange-700" :
                                    "bg-blue-50 text-blue-600"
                        )}>
                            {item.status}
                        </Badge>
                    </div>

                    {hasHistory && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-main-green/60 hover:text-main-green transition-colors bg-gray-50 px-4 py-2 rounded-xl"
                        >
                            <History size={14} />
                            <span>{isExpanded ? "Hide History" : "View History"}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasHistory && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="mt-6 pt-6 border-t border-dashed border-gray-100 space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment History</p>
                                <span className="text-[9px] font-bold text-gray-400">{item.subRepayments.length} Payments recorded</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.subRepayments.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 rounded-[20px] bg-gray-50/50 hover:bg-lemon-primary/5 transition-colors border border-transparent hover:border-lemon-primary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lemon-primary">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Paid on</p>
                                                <p className="text-xs font-bold text-gray-600">{formatDate(sub?.paidAt || "")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Amount</p>
                                            <span className="text-sm font-black text-main-green">{formatCurrency(sub.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {item.status === "PENDING" && !item.paidAt && (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-blue-50/30 text-blue-600 text-[10px] font-bold border border-blue-100/20">
                    <AlertCircle size={16} />
                    <p>
                        This payment is due in <span className="text-base font-black mx-1">
                            {Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                        </span> days
                    </p>
                </div>
            )}
        </div>
    );
};

const RepaymentTabBorrower = ({ loan }: { loan: Loan }) => {
    const repayments = loan?.repayments || [];

    return (
        <TabsContent value="repayment" className="mt-0 outline-none">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div className="space-y-6 col-span-full xl:col-span-1">
                    {repayments.toSorted((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((item, idx) => (
                        <RepaymentCard key={item.id} item={item} index={idx} />
                    ))}

                    {repayments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 text-gray-400 italic">
                            <div className="size-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 text-gray-200">
                                <Clock size={40} />
                            </div>
                            <p className="text-lg font-bold">No repayment schedule found</p>
                            <p className="text-sm">Information about your installments will appear here.</p>
                        </div>
                    )}
                </div>

                {/* Optional summary card or illustration for desktop */}
                <div className="hidden xl:block col-span-1 sticky top-8">
                    <Card className="border-none shadow-sm rounded-[40px] bg-main-green text-white overflow-hidden p-8">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4">Repayment Schedule</h3>
                            <p className="text-white/70 text-sm mb-8">
                                Keep track of your installments and payment history to maintain a healthy credit score.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                    <span className="text-xs font-bold whitespace-nowrap">Total Remaining</span>
                                    <span className="text-xl font-black">
                                        {formatCurrency(repayments.reduce((acc, r) => r.status !== "PAID" ? acc + Number(r.amount) : acc, 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                    <span className="text-xs font-bold whitespace-nowrap">Next Payment</span>
                                    <span className="text-xl font-black">
                                        {formatCurrency(repayments.find(r => r.status !== "PAID")?.amount || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 size-64 bg-lemon-primary/10 rounded-full blur-3xl" />
                    </Card>
                </div>
            </div>
        </TabsContent>
    );
};