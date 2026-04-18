import { useState } from "react";
import { ArrowLeft, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData } from "../types";

interface TermsStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    summary: any;
    onSubmit: () => void;
    onBack: () => void;
    app: any;
}

export function TermsStep({ formData, update, summary, onSubmit, onBack, app }: TermsStepProps) {
    const [viewFull, setViewFull] = useState(false);

    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 8 of 8</Badge>
                <h2 className="text-3xl font-black">Almost There!</h2>
                <p className="text-gray-500">Review your summary and confirm to receive your funds.</p>
            </div>

            <Card className="border-none bg-gray-50 rounded-[32px] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Loan Amount</span>
                            <span className="font-black text-main-green">₦{formData.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total Repayment</span>
                            <span className="font-black text-main-green">₦{summary?.totalPayable?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Disbursement Date</span>
                            <span className="font-black text-main-green">Today</span>
                        </div>
                    </div>

                    <Separator className="bg-gray-200/50" />

                    <div className="flex gap-3">
                        <div className="size-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Late payments attract a charge of <span className="font-black text-red-600">{app.repaymentPlans?.[0]?.lateFeesPercentage || 5}%</span> daily after the due date.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6 pt-4">
                <div className="flex items-start space-x-3 p-2">
                    <Checkbox
                        id="terms"
                        className="mt-1 size-5 rounded-md border-2 border-main-green data-[state=checked]:bg-main-green transition-all"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => update({ agreedToTerms: !!checked })}
                    />
                    <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                        I have read and agree to the <button onClick={() => window.open("/terms", "_blank")} className="text-main-green cursor-pointer font-bold underline" >Terms of Service</button> and authorize automated repayment from my linked account.
                    </label>
                </div>

                <Button
                    onClick={onSubmit}
                    disabled={!formData.agreedToTerms}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black shadow-xl shadow-main-green/20"
                >
                    Accept & Get Loan <Zap size={18} className="ml-2 fill-current" />
                </Button>
            </div>
        </div>
    );
}
