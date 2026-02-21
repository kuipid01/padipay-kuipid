"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Phone, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const forgotSchema = z.object({
    phone: z
        .string()
        .min(10, "Enter a valid phone number")
        .regex(/^\+?[0-9\s\-()]+$/, "Enter a valid phone number"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function BorrowerForgotPasscodePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedPhone, setSubmittedPhone] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotValues>({
        resolver: zodResolver(forgotSchema),
    });

    async function onSubmit(values: ForgotValues) {
        setIsLoading(true);
        try {
            await fetch("/api/borrower-auth/forgot-passcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: values.phone }),
            });
        } finally {
            // Always show success state for security (don't reveal if phone exists)
            setSubmittedPhone(values.phone);
            setIsSuccess(true);
            toast.success("Reset instructions sent!");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#d7e9d1]/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[500px] bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl flex flex-col items-center"
            >
                <div className="size-16 bg-lemon-primary/20 text-main-green rounded-full flex items-center justify-center mb-8">
                    {isSuccess ? <CheckCircle2 size={32} /> : <Phone size={32} />}
                </div>

                {isSuccess ? (
                    /* ── Success state ── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center w-full"
                    >
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2">
                            Check your phone
                        </h1>
                        <p className="text-gray-500 mb-2 text-sm">
                            If{" "}
                            <span className="font-semibold text-gray-700">{submittedPhone}</span>{" "}
                            is registered with us, you'll receive reset instructions shortly.
                        </p>
                        <p className="text-gray-400 text-xs mb-8">
                            Didn't receive anything? Check your number and try again.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-bold border-main-green text-main-green hover:bg-main-green hover:text-white"
                            onClick={() => setIsSuccess(false)}
                        >
                            Try again
                        </Button>
                    </motion.div>
                ) : (
                    /* ── Form state ── */
                    <>
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2 text-center">
                            Forgot Passcode?
                        </h1>
                        <p className="text-gray-500 mb-8 text-center text-sm leading-relaxed">
                            Enter your registered phone number and we&apos;ll send you instructions
                            to reset your passcode.
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                            <div>
                                <div className="relative">
                                    <Phone
                                        size={18}
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <Input
                                        {...register("phone")}
                                        type="tel"
                                        placeholder="Phone number"
                                        className="h-14 bg-[#f8fbf7] rounded-2xl pl-12 pr-6"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                disabled={isLoading}
                                className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black shadow-lg"
                                type="submit"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    </>
                )}

                <Link
                    href="/borrower/login"
                    className="flex items-center gap-2 mt-8 text-gray-400 font-bold hover:text-main-green transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to login
                </Link>
            </motion.div>
        </div>
    );
}
