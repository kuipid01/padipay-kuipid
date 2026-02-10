import { ArrowLeft, Wallet, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FormData } from "../types";

interface OfferStepProps {
    app: any;
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    summary: any;
    onNext: () => void;
    onBack: () => void;
}

export function OfferStep({ app, formData, update, summary, onNext, onBack }: OfferStepProps) {
    const plans = app.repaymentPlans || [];
    const activePlan = plans.find((p: any) => p.id === formData.planId) || plans[0];

    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 6 of 8</Badge>
                <h2 className="text-3xl font-black">Your Loan Offer</h2>
                <p className="text-gray-500">Personalize your loan amount and repayment period.</p>
            </div>

            <div className="p-8 bg-main-green rounded-[32px] text-white space-y-2 shadow-2xl shadow-main-green/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} />
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Approved Amount</p>
                <h3 className="text-5xl font-black">₦{formData.amount.toLocaleString()}</h3>
                <div className="flex items-center gap-2 pt-4">
                    <Badge className="bg-white/10 text-white font-bold border-none">{activePlan.interestRate}% Interest</Badge>
                    <Badge className="bg-lemon-primary text-main-green font-bold border-none">{activePlan.durationDays} Days</Badge>
                </div>
            </div>

            <div className="space-y-8 pt-4">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">How much do you need?</label>
                        <span className="text-lg font-black text-main-green">₦{formData.amount.toLocaleString()}</span>
                    </div>
                    <Slider
                        min={app.minLoanAmount || 0}
                        max={app.maxLoanAmount || 500000}
                        step={1000}
                        value={[formData.amount]}
                        onValueChange={(val) => update({ amount: val[0] })}
                        className="py-4"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-2 uppercase">
                        <span>Min: ₦{app.minLoanAmount.toLocaleString()}</span>
                        <span>Max: ₦{app.maxLoanAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Repayment Plan</label>
                    <div className="grid grid-cols-1 gap-3">
                        {plans.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => update({ planId: p.id })}
                                className={cn(
                                    "p-4 rounded-[24px] border-2 transition-all cursor-pointer flex items-center justify-between",
                                    formData.planId === p.id
                                        ? "border-main-green bg-main-green/5 ring-4 ring-main-green/5"
                                        : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <div className="space-y-1">
                                    <p className="font-black">{p.name}</p>
                                    <p className="text-xs text-gray-500">{p.durationDays} days • {p.interestRate}% interest</p>
                                </div>
                                {formData.planId === p.id && (
                                    <div className="size-6 rounded-full bg-main-green flex items-center justify-center text-white">
                                        <Check size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-6 bg-lemon-primary/10 rounded-[28px] border border-lemon-primary/20">
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Due Date</p>
                    <p className="text-xs font-black text-main-green">{new Date(Date.now() + activePlan.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
                <div className="text-center border-x border-main-green/5">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Fees</p>
                    <p className="text-xs font-black text-main-green">₦{summary?.totalInterest?.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total</p>
                    <p className="text-xs font-black text-main-green">₦{summary?.totalPayable?.toLocaleString()}</p>
                </div>
            </div>

            <Button
                onClick={onNext}
                className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
            >
                Confirm Offer <ArrowRight className="ml-2" />
            </Button>
        </div>
    );
}
