import { motion } from "framer-motion";
import { ArrowLeft, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormData, Status } from "../types";

interface PhoneStepProps {
    formData: FormData;
    status: Status;
    update: (updates: Partial<FormData>) => void;
    onSendOtp: () => void;
    onVerify: () => void;
    loading: boolean;
    countdown: number;
    onBack: () => void;
}

export function PhoneStep({ formData, status, update, onSendOtp, onVerify, loading, countdown, onBack }: PhoneStepProps) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 1 of 8</Badge>
                <h2 className="text-3xl font-black">Your Phone Number</h2>
                <p className="text-gray-500">We&apos;ll send a secure code to protect your account.</p>
            </div>

            <div className="space-y-6">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                        <Smartphone size={20} />
                    </div>
                    <Input
                        placeholder="0800 000 0000"
                        value={formData.phone}
                        onChange={(e) => update({ phone: e.target.value })}
                        className="h-16 pl-14 pr-6 rounded-[24px] border-2 border-gray-100 focus:border-main-green/20 focus:ring-4 focus:ring-main-green/5 text-xl font-bold transition-all"
                        disabled={status.otpSent}
                    />
                </div>

                {!status.otpSent ? (
                    <Button
                        onClick={onSendOtp}
                        disabled={loading || formData.phone.length < 10}
                        className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Send Code"}
                    </Button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <Input
                            placeholder="6-digit code"
                            value={formData.otp}
                            onChange={(e) => update({ otp: e.target.value })}
                            className="h-16 text-center text-2xl font-black tracking-[0.5em] rounded-[24px] border-2 border-main-green/10"
                            maxLength={6}
                        />
                        <Button
                            onClick={onVerify}
                            disabled={loading || formData.otp.length < 6}
                            className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Verify Code"}
                        </Button>
                        <p className="text-center text-sm font-bold text-gray-400">
                            Didn&apos;t get it? {countdown > 0 ? `Resend in ${countdown}s` : <button className="text-main-green underline" onClick={onSendOtp}>Resend now</button>}
                        </p>
                    </motion.div>
                )}
            </div>

            <p className="text-[12px] text-gray-400 leading-relaxed text-center px-4">
                By continuing, you agree to receive SMS notifications. Message and data rates may apply.
            </p>
        </div>
    );
}
