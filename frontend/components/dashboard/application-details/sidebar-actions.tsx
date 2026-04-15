"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Mail, AlertCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Application } from "./types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarActionsProps {
    application: Application;
}

export function SidebarActions({ application }: SidebarActionsProps) {
    const [actionState, setActionState] = useState<{ isOpen: boolean; type: "APPROVE" | "REJECT" | "FUND" | null }>({
        isOpen: false,
        type: null,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handleConfirmAction = async () => {
        if (!actionState.type) return;
        setIsProcessing(true);
        try {
            let res: Response;
            if (actionState.type === "FUND") {
                res = await fetch(`/api/applications/${application.id}/fund`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
            } else {
                res = await fetch(`/api/applications/${application.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: actionState.type === "APPROVE" ? "APPROVED" : "REJECTED" }),
                });
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to ${actionState.type.toLowerCase()} application`);
            }

            toast.success(`Application successfully ${actionState.type === "APPROVE" ? "approved" : actionState.type === "REJECT" ? "rejected" : "funded"}`);
            setActionState({ isOpen: false, type: null });
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

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
                                    onClick={() => setActionState({ isOpen: true, type: "APPROVE" })}
                                    disabled={isProcessing}
                                >
                                    Approve Application
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-black h-14 rounded-2xl bg-white shadow-sm text-lg"
                                    onClick={() => setActionState({ isOpen: true, type: "REJECT" })}
                                    disabled={isProcessing}
                                >
                                    Reject Request
                                </Button>
                            </div>
                        ) : application.status === "APPROVED" ? (
                            <div className="space-y-3">
                                <Button
                                    className="w-full bg-main-green text-white hover:bg-main-green/90 font-black h-14 rounded-2xl shadow-lg shadow-main-green/20 transition-all active:scale-95 text-lg"
                                    onClick={() => setActionState({ isOpen: true, type: "FUND" })}
                                    disabled={isProcessing}
                                >
                                    Fund Loan
                                </Button>
                                <div className="flex items-center gap-2 p-4 rounded-2xl bg-green-50/50 border border-green-100 italic">
                                    <AlertCircle size={16} className="text-green-600" />
                                    <p className="text-xs text-green-700 font-medium">Application approved. Ready for funding.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <Badge className={cn(
                                        "font-black text-[10px] border-none uppercase tracking-widest h-7 px-3",
                                        application.status === "FUNDED" ? "bg-blue-50 text-blue-600" : "bg-main-green text-white"
                                    )}>
                                        {application.status}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <Separator className="bg-gray-100" />
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

            <Dialog
                open={actionState.isOpen}
                onOpenChange={(isOpen) => !isProcessing && setActionState(prev => ({ ...prev, isOpen }))}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionState.type === "APPROVE" ? "Approve Application?" :
                                actionState.type === "FUND" ? "Disburse Funds?" : "Reject Application?"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionState.type === "APPROVE"
                                ? "Are you sure you want to approve this loan application? This action will generate the loan offer and notify the borrower."
                                : actionState.type === "FUND"
                                    ? "This action will mark the loan as funded and notify the borrower that funds have been disbursed."
                                    : "Are you sure you want to reject this loan application? The borrower will be notified of this decision."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionState({ isOpen: false, type: null })}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionState.type === "REJECT" ? "destructive" : "default"}
                            className={cn(
                                actionState.type === "APPROVE" && "bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-bold",
                                actionState.type === "FUND" && "bg-main-green text-white hover:bg-main-green/90 font-bold"
                            )}
                            onClick={handleConfirmAction}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            ) : null}
                            {actionState.type === "APPROVE" ? "Confirm Approval" :
                                actionState.type === "FUND" ? "Confirm Funding" : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
