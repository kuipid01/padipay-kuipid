import { ArrowLeft, Wallet, Check, ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { FormData } from "../types";
import { useMemo, useState, useRef, useEffect } from "react";

interface OfferStepProps {
    app: any;
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    summary: any;
    onNext: () => void;
    onBack: () => void;
}

function generatePresets(min: number, max: number): number[] {
    const range = max - min;
    if (range <= 0) return [min];

    // Generate 4-6 evenly spaced presets between min and max
    const steps = Math.min(6, Math.max(4, Math.floor(range / 10000)));
    const increment = Math.round(range / (steps - 1) / 1000) * 1000; // Round to nearest 1000
    const presets: number[] = [];

    for (let i = 0; i < steps; i++) {
        const val = min + increment * i;
        if (val <= max) presets.push(val);
    }

    // Always include max
    if (presets[presets.length - 1] !== max) {
        presets.push(max);
    }

    return [...new Set(presets)];
}

function formatCompact(n: number): string {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0)}K`;
    return `₦${n.toLocaleString()}`;
}

export function OfferStep({ app, formData, update, summary, onNext, onBack }: OfferStepProps) {
    const plans = app.repaymentPlans || [];
    const activePlan = plans.find((p: any) => p.id === formData.planId) || plans[0];
    const min = app.minLoanAmount || 0;
    const max = app.maxLoanAmount || 500000;

    const [isCustom, setIsCustom] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const presets = useMemo(() => generatePresets(min, max), [min, max]);

    useEffect(() => {
        if (isCustom && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCustom]);

    const handleCustomSubmit = () => {
        const parsed = parseInt(customValue.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(parsed)) {
            const clamped = Math.max(min, Math.min(max, parsed));
            update({ amount: clamped });
            setCustomValue("");
        }
        setIsCustom(false);
    };

    const isPresetActive = (preset: number) => formData.amount === preset;

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
                {/* Amount Selection */}
                <div className="space-y-5">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">How much do you need?</label>
                        <span className="text-lg font-black text-main-green">₦{formData.amount.toLocaleString()}</span>
                    </div>

                    {/* Preset Amount Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                    update({ amount: preset });
                                    setIsCustom(false);
                                }}
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 border-2",
                                    isPresetActive(preset)
                                        ? "bg-main-green text-white border-main-green shadow-lg shadow-main-green/20 scale-105"
                                        : "bg-white text-main-green border-gray-100 hover:border-main-green/30 hover:bg-main-green/5"
                                )}
                            >
                                {formatCompact(preset)}
                            </button>
                        ))}

                        {/* Custom Amount Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsCustom(!isCustom)}
                            className={cn(
                                "px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 border-2 flex items-center gap-1.5",
                                isCustom
                                    ? "bg-main-green text-white border-main-green shadow-lg shadow-main-green/20"
                                    : "bg-white text-gray-500 border-dashed border-gray-200 hover:border-main-green/30 hover:text-main-green"
                            )}
                        >
                            <Pencil size={12} /> Custom
                        </button>
                    </div>

                    {/* Custom Amount Input */}
                    {isCustom && (
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₦</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value.replace(/[^0-9]/g, ""))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCustomSubmit();
                                    }}
                                    placeholder={`${min.toLocaleString()} – ${max.toLocaleString()}`}
                                    className="w-full h-12 pl-8 pr-4 rounded-2xl border-2 border-gray-100 focus:border-main-green focus:ring-4 focus:ring-main-green/10 outline-none font-black text-main-green text-sm transition-all"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleCustomSubmit}
                                className="h-12 px-5 rounded-2xl bg-main-green text-white font-black text-xs shrink-0"
                            >
                                Apply
                            </Button>
                        </div>
                    )}

                    {/* Slider */}
                    <Slider
                        min={min}
                        max={max}
                        step={1000}
                        value={[formData.amount]}
                        onValueChange={(val) => {
                            update({ amount: val[0] });
                            setIsCustom(false);
                        }}
                        className="py-4"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-2 uppercase">
                        <span>Min: ₦{min.toLocaleString()}</span>
                        <span>Max: ₦{max.toLocaleString()}</span>
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
