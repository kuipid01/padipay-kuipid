import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormData, Status } from "../types";

interface EmailStepProps {
    formData: FormData;
    status: Status;
    update: (updates: Partial<FormData>) => void;
    onSendOtp: () => void;
    onVerify: () => void;
    loading: boolean;
    countdown: number;
    onBack: () => void;
}

export function EmailStep({ formData, status, update, onSendOtp, onVerify, loading, countdown, onBack }: EmailStepProps) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 2 of 8</Badge>
                <h2 className="text-3xl font-black">Email Address</h2>
                <p className="text-gray-500">Verify your email to receive important loan documents.</p>
            </div>

            <div className="space-y-6">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                        <Mail size={20} />
                    </div>
                    <Input
                        placeholder="email@example.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => update({ email: e.target.value })}
                        className="h-16 pl-14 pr-6 rounded-[24px] border-2 border-gray-100 focus:border-main-green/20 focus:ring-4 focus:ring-main-green/5 text-xl font-bold transition-all"
                        disabled={status.emailOtpSent}
                    />
                </div>

                {!status.emailOtpSent ? (
                    <Button
                        onClick={onSendOtp}
                        disabled={loading || !formData.email.includes('@')}
                        className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Verify Email"}
                    </Button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <Input
                            placeholder="6-digit code"
                            value={formData.emailOtp}
                            onChange={(e) => update({ emailOtp: e.target.value })}
                            className="h-16 text-center text-2xl font-black tracking-[0.5em] rounded-[24px] border-2 border-main-green/10"
                            maxLength={6}
                        />
                        <Button
                            onClick={onVerify}
                            disabled={loading || formData.emailOtp.length < 6}
                            className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Confirm Code"}
                        </Button>
                        <p className="text-center text-sm font-bold text-gray-400">
                            Didn&apos;t get it? {countdown > 0 ? `Resend in ${countdown}s` : <button className="text-main-green underline" onClick={onSendOtp}>Resend now</button>}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
