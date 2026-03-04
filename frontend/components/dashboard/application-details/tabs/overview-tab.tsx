"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Application } from "../types";
import { InfoRow, TimelineStep } from "../shared-components";

interface OverviewTabProps {
    application: Application;
    ficoScore: number | undefined;
    riskLevel: string;
    normalizedRiskScore: number;
    totalActiveLoans: number;
    totalOutstanding: number;
}

export function OverviewTab({
    application,
    ficoScore,
    riskLevel,
    normalizedRiskScore,
    totalActiveLoans,
    totalOutstanding,
}: OverviewTabProps) {
    const creditReport = application?.borrower?.creditReport?.entity;
    const fullName = `${application?.borrower?.firstName ?? "NA"} ${application?.borrower?.lastName ?? ""}`;

    return (
        <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-6 mb-8 text-left">
                            <Avatar className="size-20 rounded-3xl border-4 border-lemon-primary/20">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                                />
                                <AvatarFallback className="bg-lemon-primary text-main-green font-black text-2xl">
                                    {fullName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-2xl font-black text-main-green">
                                    {fullName}
                                </h3>
                                <p className="text-gray-400 font-bold mb-3 uppercase text-[10px] tracking-widest">
                                    Qualified Borrower
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">
                                        BVN VERIFIED
                                    </Badge>
                                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                                        KYC LEVEL 3
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <InfoRow
                                icon={<Mail size={16} />}
                                label="Email"
                                value={application.borrower.email}
                            />
                            <InfoRow
                                icon={<Phone size={16} />}
                                label="Phone"
                                value={application.borrower.phone || "---"}
                            />
                            <InfoRow
                                icon={<MapPin size={16} />}
                                label="Location"
                                value={
                                    application.borrower.creditReport?.entity?.address ||
                                    "Lagos, Nigeria"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[32px] bg-main-green text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 size-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                    <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">
                                Risk Assessment
                            </p>
                            <div className="flex items-end justify-between mb-2">
                                <h4 className="text-4xl font-black uppercase">
                                    {riskLevel} Risk
                                </h4>
                                <span className="text-lemon-primary font-black text-2xl">
                                    {ficoScore || "N/A"}
                                    {ficoScore && (
                                        <span className="text-lg text-white/60 font-bold">
                                            /850
                                        </span>
                                    )}
                                </span>
                            </div>
                            <Progress
                                value={normalizedRiskScore}
                                className="h-2 bg-white/10"
                            />
                            {creditReport?.score?.ficoScore?.reasons && (
                                <p className="text-xs text-white/60 font-medium mt-4 line-clamp-3">
                                    {creditReport.score.ficoScore.reasons}
                                </p>
                            )}
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5">
                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">
                                    Active Loans
                                </p>
                                <p className="font-bold text-sm">
                                    {totalActiveLoans} Active
                                </p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5">
                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">
                                    Total Outstanding
                                </p>
                                <p className="font-bold text-sm">
                                    ₦{totalOutstanding.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black text-main-green">
                        Loan Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">
                                Requested Amount
                            </p>
                            <p className="text-3xl font-black text-main-green">
                                ₦{parseFloat(application.amount).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">
                                Interest Rate
                            </p>
                            <p className="text-3xl font-black text-main-green">
                                {application.interestRate}%
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">
                                Duration
                            </p>
                            <p className="text-3xl font-black text-main-green">
                                {application.durationMonths} Mo
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">
                                Monthly Pay
                            </p>
                            <p className="text-3xl font-black text-main-green">
                                ₦
                                {(
                                    (parseFloat(application.amount) *
                                        (1 + parseFloat(application.interestRate) / 100)) /
                                    application.durationMonths
                                ).toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">
                            Application Timeline
                        </p>
                        <div className="flex items-center">
                            <TimelineStep
                                status="completed"
                                label="Submitted"
                                date={format(new Date(application.createdAt), "MMM d")}
                                isFirst
                            />
                            <TimelineStep status="current" label="Reviewing" />
                            <TimelineStep status="upcoming" label="Decision" />
                            <TimelineStep status="upcoming" label="Funding" isLast />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
