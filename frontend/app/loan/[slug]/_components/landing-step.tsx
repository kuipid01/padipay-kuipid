import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Shield, Zap } from "lucide-react";

interface LandingStepProps {
    app: any; // Using any as per original code context, but ideally should be typed
    onNext: () => void;
}

export function LandingStep({ app, onNext }: LandingStepProps) {
    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-700">
            <div className="size-20 bg-main-green rounded-[24px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-main-green/20">
                {app.name.charAt(0)}
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight leading-tight">
                    Check your loan eligibility in <span className="text-main-green">5 minutes</span>
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed">
                    No collateral. No long forms. Instant disbursement for <span className="font-bold text-main-green">{app.name}</span> members.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="p-4 bg-lemon-primary/10 rounded-[20px] border border-lemon-primary/20">
                    <Shield className="text-main-green mb-2" size={24} />
                    <p className="font-bold text-sm">NDPR Compliant</p>
                    <p className="text-[11px] text-gray-500">Your data is safe</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-[20px] border border-blue-100">
                    <Zap className="text-blue-600 mb-2" size={24} />
                    <p className="font-bold text-sm">Fast Funding</p>
                    <p className="text-[11px] text-gray-500">Disbursed in mins</p>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <Button
                    onClick={onNext}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-main-green/20"
                >
                    Get Started <ArrowRight className="ml-2" />
                </Button>
                <Button
                    onClick={() => globalThis.location.href = '/login'}
                    variant="ghost"
                    className="w-full h-14 rounded-[24px] text-main-green text-base font-bold hover:bg-main-green/5"
                >
                    Already have an account? Login
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <Lock size={12} /> Secure 256-bit Encryption
                </div>
            </div>
        </div>
    );
}
