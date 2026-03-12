import { useState, useEffect } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CreditCard, Lock, RefreshCw, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface BankStepProps {
    email: string;
    onConnect: (data: any) => void;
    onSkip: () => void;
    onBack: () => void;
    summary: any;
}

export function BankStep({ email, onConnect, onSkip, onBack, summary }: BankStepProps) {
    type BankSubStep = 'explanation' | 'initializing' | 'redirecting' | 'success';
    const [subStep, setSubStep] = useState<BankSubStep>('explanation');
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        const status = searchParams.get('status');
        const step = searchParams.get('step');

        if (status === 'success' && step === 'bank') {
            setSubStep('success');
            setTimeout(() => {
                onConnect({ bankConnected: true });
                // clear query params
                router.replace(pathname);
            }, 3000);
        }
    }, [searchParams, onConnect]);

    const handleInitialize = async () => {
        setSubStep('initializing');
        try {
            const res = await fetch(`/api/payments/initialize`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    callback: "bank_set",
                    loanAppSlug: slug,
                    type: "BORROWER_ADD_CARD",
                    borrowerEmail: email,
                    amount: 100,
                    callbackUrl: `${globalThis.location.origin}/loan/${slug}?step=bank&status=success`,
                }),
            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to initialize bank connection");
            console.log(result)
            // return
            const paymentUrl = result.data?.authorization_url || result.data?.paymentUrl;

            if (paymentUrl) {
                setSubStep('redirecting');
                // Small delay to show the redirecting state
                setTimeout(() => {
                    globalThis.location.href = paymentUrl;
                }, 1500);
            } else {
                // If no payment URL, maybe it's already connected or something?
                toast.success("Bank already connected or not required.");
                onConnect({ bankConnected: true });
            }
        } catch (err: any) {
            console.error("Bank initialization error:", err);
            toast.error(err.message || "Failed to connect bank. Please try again.");
            setSubStep('explanation');
        }
    };

    const renderSubStep = () => {
        switch (subStep) {
            case 'explanation':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2">
                            <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 5 of 8</Badge>
                            <h2 className="text-3xl font-black">Enable Auto-Payment</h2>
                            <p className="text-gray-500">To secure your loan, we need to authorize your bank for automatic repayments.</p>
                        </div>

                        <Card className="border-none bg-lemon-primary/10 rounded-[32px] overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-main-green shadow-sm shrink-0">
                                    <Zap size={28} className="fill-main-green" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-main-green">₦100 Verification Fee</p>
                                    <p className="text-xs text-main-green/70">A one-time charge to securely link your bank account for auto-debit.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheck, title: "Secure Bank Linking", desc: "We use Paystack to safely authorize your account." },
                                { icon: CreditCard, title: "Automatic Repayments", desc: "No need to worry about missing due dates." },
                                { icon: Lock, title: "Bank-Grade Security", desc: "Your financial data is always encrypted and safe." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-[24px] bg-gray-50 border border-gray-100">
                                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-main-green shadow-sm">
                                        <item.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={handleInitialize}
                                className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black shadow-lg shadow-main-green/20"
                            >
                                Continue to Paystack
                            </Button>
                            <button
                                onClick={onSkip}
                                className="w-full text-center text-sm font-bold text-gray-400 hover:text-main-green transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </motion.div>
                );

            case 'initializing':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="size-32 rounded-full border-4 border-dashed border-main-green/20 flex items-center justify-center"
                            >
                                <RefreshCw className="text-main-green animate-spin" size={48} />
                            </motion.div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Initialising Secure Connection</h3>
                            <p className="text-gray-400 text-sm animate-pulse">Setting up your Paystack checkout...</p>
                        </div>
                    </div>
                );

            case 'redirecting':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                        <div className="size-32 rounded-full bg-main-green/10 flex items-center justify-center text-main-green">
                            <Loader2 className="animate-spin" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Redirecting to Paystack</h3>
                            <p className="text-gray-400 text-sm">Please complete the ₦100 payment to continue.</p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="size-32 rounded-full bg-lemon-primary flex items-center justify-center text-main-green">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <CheckCircle size={64} />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black">Linked Successfully!</h2>
                            <p className="text-gray-500">Your bank account is now linked for auto-repayment.</p>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Continuing in a moment...</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative">
            {subStep === 'explanation' ? (
                <button
                    onClick={onBack}
                    className="absolute -top-12 left-0 size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors z-10"
                >
                    <ArrowLeft size={18} />
                </button>
            ) : null}
            <div className="pt-4">
                {renderSubStep()}
            </div>
        </div>
    );
}








