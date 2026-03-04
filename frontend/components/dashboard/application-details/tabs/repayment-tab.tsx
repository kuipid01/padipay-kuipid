"use client";

import { ShieldCheck, Eye, Calendar, Clock, CheckCircle2, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Application } from "../types";
import { formatCurrency, cn } from "@/lib/utils";

interface RepaymentTabProps {
    application: Application;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getRepaymentStatusConfig = (status: string) => {
    switch (status) {
        case "PAID":
            return { label: "Fulfilled", color: "bg-green-50 text-green-600", icon: CheckCircle2 };
        case "PENDING":
            return { label: "Upcoming", color: "bg-blue-50 text-blue-600", icon: Clock };
        case "OVERDUE":
            return { label: "Overdue", color: "bg-red-50 text-red-600", icon: ShieldCheck };
        default:
            return { label: status, color: "bg-gray-50 text-gray-600", icon: History };
    }
};

export function RepaymentTab({ application }: RepaymentTabProps) {
    const repayments = application.loan?.repayments || [];
    const totalRepayable = application.loan ? parseFloat(application.loan.totalPayable) : (parseFloat(application.amount) * (1 + parseFloat(application.interestRate) / 100));

    return (
        <TabsContent value="repayment" className="mt-0 space-y-8">
            {/* Auto-Repayment Status Card */}
            <Card className="border-none shadow-sm rounded-[32px] bg-white">
                <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-main-green">
                                    Automatic Repayment Setup
                                </h4>
                                <p className="text-gray-500 font-medium">
                                    Valid credit card has been linked for auto-debit.
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-green-50 text-green-600 font-bold border-none px-4 h-9 uppercase tracking-widest text-[10px]">
                            Active
                        </Badge>
                    </div>

                    <Separator className="bg-gray-50" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 italic font-black text-blue-800">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-bold text-main-green">
                                        Ending in 8902
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Expires 12/26
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-main-green"
                            >
                                <Eye size={18} />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Summary
                            </p>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-400">Installments</span>
                                <span className="text-main-green">
                                    {application.durationMonths} Monthly Payments
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-400">Total Repayable</span>
                                <span className="text-main-green">
                                    {formatCurrency(totalRepayable)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Repayment Schedule Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                    <div className="size-8 rounded-xl bg-main-green/10 flex items-center justify-center text-main-green">
                        <Calendar size={18} />
                    </div>
                    <h5 className="text-xl font-black text-main-green">Repayment Schedule</h5>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {repayments.length > 0 ? (
                        repayments.map((repayment, index) => {
                            const config = getRepaymentStatusConfig(repayment.status);
                            const StatusIcon = config.icon;

                            return (
                                <Card key={repayment.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white group hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-sm">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                                                    <p className="text-lg font-black text-gray-900">{formatDate(repayment.dueDate)}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 md:text-center">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                                                <p className="text-xl font-black text-main-green">{formatCurrency(repayment.amount)}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Badge className={cn("px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider border-none", config.color)}>
                                                    <StatusIcon size={14} className="mr-2" />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Audit Log / Breakdown for this repayment */}
                                        {repayment.payments && repayment.payments.length > 0 && (
                                            <div className="px-8 pb-8 pt-0">
                                                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <History size={14} className="text-gray-400" />
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Audit Log</p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {repayment.payments.map((payment) => (
                                                            <div key={payment.id} className="flex items-center justify-between text-sm py-2 border-b border-white last:border-0">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-2 rounded-full bg-main-green" />
                                                                    <span className="text-gray-600 font-medium">
                                                                        {formatDate(payment.paidAt)} via {payment.method}
                                                                    </span>
                                                                </div>
                                                                <span className="font-black text-main-green">
                                                                    {formatCurrency(payment.amount)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                            <Clock size={40} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-400 font-bold">No repayment records found for this application.</p>
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
    );
}
