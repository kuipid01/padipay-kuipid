"use client";

import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HistoryTabProps {
    loanHistory: any[];
}

export function HistoryTab({ loanHistory }: HistoryTabProps) {
    return (
        <TabsContent value="history" className="mt-0">
            <div className="space-y-4">
                {loanHistory.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-[32px] bg-gray-50/30">
                        <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="size-20 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-200 mb-4 border border-gray-100">
                                <History size={40} />
                            </div>
                            <h4 className="text-xl font-black text-main-green mb-2">
                                New Borrower
                            </h4>
                            <p className="text-gray-500 max-w-sm font-medium">
                                This is the borrower's first application on MyCashNG.
                                No historical data available.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    loanHistory.map((loan: any, idx: number) => (
                        <Card
                            key={idx}
                            className="border-none shadow-sm rounded-3xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                            {loan.loanProvider || "Unknown Provider"}
                                        </p>
                                        <h4 className="text-lg font-black text-main-green">
                                            {loan.type || "Loan"}
                                        </h4>
                                    </div>
                                    <Badge
                                        variant={
                                            loan.status?.toLowerCase() === "open"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className={cn(
                                            "font-bold",
                                            loan.status?.toLowerCase() === "open" &&
                                            "bg-lemon-primary text-main-green hover:bg-lemon-primary",
                                            loan.status?.toLowerCase() === "closed" &&
                                            "bg-gray-100 text-gray-500 hover:bg-gray-100",
                                        )}
                                    >
                                        {loan.status || "Unknown"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            Amount
                                        </p>
                                        <p className="font-bold text-main-green">
                                            ₦{Number(loan.loanAmount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            Balance
                                        </p>
                                        <p className="font-bold text-main-green">
                                            ₦
                                            {Number(loan.outstandingBalance).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            Performance
                                        </p>
                                        <p
                                            className="font-bold text-main-green line-clamp-1"
                                            title={loan.performanceStatus}
                                        >
                                            {loan.performanceStatus || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            Last Reported
                                        </p>
                                        <p className="font-bold text-main-green">
                                            {loan.dateReported
                                                ? format(
                                                    new Date(
                                                        loan.dateReported.split("T")[0] ||
                                                        Date.now(),
                                                    ),
                                                    "MMM d, yyyy",
                                                )
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </TabsContent>
    );
}
