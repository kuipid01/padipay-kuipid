import { ArrowLeft, Info, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FormData } from "../types";

interface BvnStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    onVerify: () => void;
    loading: boolean;
    onBack: () => void;
}

export function BvnStep({ formData, update, onVerify, loading, onBack }: BvnStepProps) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 4 of 8</Badge>
                <h2 className="text-3xl font-black">Verify Identity</h2>
                <p className="text-gray-500">Verify your BVN to auto-fill your details securely.</p>
            </div>

            <Card className="border-none bg-blue-50/50 rounded-[28px] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-blue-900">Why BVN?</p>
                            <p className="text-xs text-blue-800/70 leading-relaxed">
                                Nigerian regulations require BVN to confirm your identity. We <span className="font-black">cannot</span> debit your account or see your balance.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">BVN (11 Digits)</label>
                    <Input
                        placeholder="22123456789"
                        value={formData.bvn}
                        onChange={(e) => update({ bvn: e.target.value })}
                        className="h-16 px-6 rounded-[24px] border-2 border-gray-100 text-xl font-mono tracking-widest placeholder:tracking-normal"
                        maxLength={11}
                    />
                </div>

                <Button
                    onClick={onVerify}
                    disabled={loading || formData.bvn.length !== 11}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black shadow-lg shadow-main-green/10"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Verify Securely"}
                </Button>

                <div className="flex items-center justify-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} className="text-green-500" /> Encrypted
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} className="text-green-500" /> Private
                    </div>
                </div>
            </div>
        </div>
    );
}
