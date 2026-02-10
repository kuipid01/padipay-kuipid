import { motion } from "framer-motion";
import { CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessStepProps {
    app: any;
    summary: any;
}

export function SuccessStep({ app, summary }: SuccessStepProps) {
    return (
        <div className="space-y-8 py-12 text-center animate-in zoom-in-95 duration-500">
            <div className="relative mx-auto size-40">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="size-40 bg-lemon-primary rounded-full flex items-center justify-center"
                >
                    <CheckCircle2 size={80} className="text-main-green" />
                </motion.div>
                <div className="absolute -top-4 -right-4 size-16 bg-main-green rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-4 border-white">
                    !
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black">Success!</h2>
                <p className="text-gray-500 text-lg leading-relaxed px-4">
                    Your loan of <span className="font-bold text-main-green">₦{summary?.principal?.toLocaleString()}</span> is on its way to your bank account.
                </p>
            </div>

            <Card className="border-none bg-main-green/5 rounded-[32px] overflow-hidden mx-4">
                <CardContent className="p-8 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">To Bank</span>
                        <span className="font-black text-main-green">Access Bank</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Est. Time</span>
                        <span className="font-black text-main-green">3 - 10 Minutes</span>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4 px-4 pt-8">
                <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                >
                    Go to Dashboard
                </Button>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Calendar size={12} /> First repayment due in 30 days
                </p>
            </div>
        </div>
    );
}
