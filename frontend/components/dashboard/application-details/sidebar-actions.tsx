"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Mail, AlertCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Application } from "./types";

interface SidebarActionsProps {
    application: Application;
}

export function SidebarActions({ application }: SidebarActionsProps) {
    const [isApproveLoading, setIsApproveLoading] = useState(false);

    return (
        <div className="xl:col-span-4 h-full">
            <div className="sticky top-28 space-y-6">
                <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-[#FAFAFA]">
                    <CardContent className="p-8 space-y-6">
                        <div>
                            <h4 className="text-lg font-black text-main-green mb-2">
                                Decision Actions
                            </h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Finalize application status
                            </p>
                        </div>

                        {application.status === "PENDING" ? (
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-14 rounded-2xl shadow-lg shadow-lemon-primary/20 transition-all active:scale-95 text-lg"
                                    onClick={() => setIsApproveLoading(true)}
                                    disabled={isApproveLoading}
                                >
                                    {isApproveLoading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Approve Application"
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-black h-14 rounded-2xl bg-white shadow-sm text-lg"
                                >
                                    Reject Request
                                </Button>
                            </div>
                        ) : (
                            <Badge className="bg-main-green text-white rounded-full px-1.5 h-5 min-w-5">
                                {" "}
                                {application.status}
                            </Badge>
                        )}

                        <Separator className="bg-gray-100" />

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Communications
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="ghost"
                                    className="bg-white border border-gray-50 rounded-2xl h-12 font-bold text-xs gap-2 shadow-sm text-main-green"
                                >
                                    <MessageSquare size={14} /> Message
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="bg-white border border-gray-50 rounded-2xl h-12 font-bold text-xs gap-2 shadow-sm text-main-green"
                                >
                                    <Mail size={14} /> Email
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                            <div className="flex gap-3">
                                <AlertCircle
                                    size={18}
                                    className="text-orange-500 shrink-0 mt-1"
                                />
                                <div>
                                    <p className="text-sm font-black text-orange-900 leading-none mb-1">
                                        Pending Documents
                                    </p>
                                    <p className="text-xs text-orange-700/70 font-medium">
                                        Bank statement is still awaiting review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="ghost"
                        className="text-gray-400 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-transparent hover:text-main-green px-0"
                    >
                        <Lock size={12} /> Internal Admin View Only
                    </Button>
                </div>
            </div>
        </div>
    );
}
