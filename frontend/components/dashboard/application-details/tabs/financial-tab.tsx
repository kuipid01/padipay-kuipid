"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { VerificationItem } from "../shared-components";

interface FinancialTabProps {
    ficoScore: number | undefined;
    totalActiveLoans: number;
    totalOutstanding: number;
    totalMonthlyInstallment: number;
}

export function FinancialTab({
    ficoScore,
    totalActiveLoans,
    totalOutstanding,
    totalMonthlyInstallment,
}: FinancialTabProps) {
    return (
        <TabsContent value="financial" className="mt-0">
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-main-green">
                                Bureau Analysis
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                                        FICO Score
                                    </p>
                                    <p className="font-bold text-xl">
                                        {ficoScore || "N/A"}
                                    </p>
                                </Card>
                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                                        Active Loans
                                    </p>
                                    <p className="font-bold text-xl">
                                        {totalActiveLoans}
                                    </p>
                                </Card>
                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                                        Total Outstanding
                                    </p>
                                    <p className="font-bold text-xl">
                                        ₦{totalOutstanding.toLocaleString()}
                                    </p>
                                </Card>
                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                                        Est. Monthly Payments
                                    </p>
                                    <p className="font-bold text-xl">
                                        ₦{totalMonthlyInstallment.toLocaleString()}
                                    </p>
                                </Card>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-black text-main-green">
                                Verification Status
                            </h4>
                            <div className="space-y-3">
                                <VerificationItem
                                    label="Phone Verification"
                                    status="Verified"
                                />
                                <VerificationItem
                                    label="Email Verification"
                                    status="Verified"
                                />
                                <VerificationItem
                                    label="BVN Confirmation"
                                    status="Verified"
                                />
                                <VerificationItem
                                    label="NIN Confirmation"
                                    status="Pending"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
