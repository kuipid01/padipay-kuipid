"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { Suspense } from "react";
import { SuspenseLoader } from "@/components/ui/suspense-loader";

const resetSchema = z
    .object({
        passcode: z
            .string()
            .min(4, "Passcode must be at least 4 digits")
            .regex(/^\d+$/, "Passcode must be numeric"),
        confirmPasscode: z.string().min(4, "Please confirm your passcode"),
    })
    .refine((data) => data.passcode === data.confirmPasscode, {
        message: "Passcodes do not match",
        path: ["confirmPasscode"],
    });

type ResetValues = z.infer<typeof resetSchema>;


function BorrowerResetPasscodeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPasscode, setShowPasscode] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetValues>({
        resolver: zodResolver(resetSchema),
    });

    async function onSubmit(values: ResetValues) {
        if (!token) {
            toast.error("Invalid or missing reset token. Please request a new reset link.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/borrower-auth/reset-passcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, passcode: values.passcode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset passcode");
            }

            setIsSuccess(true);
            toast.success("Passcode reset successfully!");
            setTimeout(() => router.push("/borrower/login"), 2000);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
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
                    <ShieldCheck size={32} />
                </div>

                {!isSuccess ? (
                    <>
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2 text-center">
                            Reset Passcode
                        </h1>
                        <p className="text-gray-500 mb-8 text-center text-sm leading-relaxed">
                            Create a new numeric passcode for your account.
                        </p>

                        {!token && (
                            <div className="w-full mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                                <p className="text-red-600 text-sm font-semibold">
                                    Invalid reset link.
                                </p>
                                <Link
                                    href="/borrower/forgot-passcode"
                                    className="text-red-500 underline text-xs mt-1 inline-block hover:text-red-700"
                                >
                                    Request a new one
                                </Link>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                            {/* New Passcode */}
                            <div>
                                <div className="relative">
                                    <Input
                                        {...register("passcode")}
                                        type={showPasscode ? "text" : "password"}
                                        placeholder="New passcode"
                                        inputMode="numeric"
                                        className="h-14 bg-[#f8fbf7] rounded-2xl px-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasscode(!showPasscode)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.passcode && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {errors.passcode.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Passcode */}
                            <div>
                                <div className="relative">
                                    <Input
                                        {...register("confirmPasscode")}
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Confirm passcode"
                                        inputMode="numeric"
                                        className="h-14 bg-[#f8fbf7] rounded-2xl px-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPasscode && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {errors.confirmPasscode.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                disabled={isLoading || !token}
                                className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black shadow-lg mt-2"
                                type="submit"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Reset Passcode"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2">All done! 🎉</h1>
                        <p className="text-gray-500 text-sm mb-4">
                            Your passcode has been reset successfully. Redirecting you to login…
                        </p>
                        <Loader2 className="animate-spin mx-auto text-main-green" size={28} />
                    </motion.div>
                )}

                {!isSuccess && (
                    <Link
                        href="/borrower/login"
                        className="flex items-center gap-2 mt-8 text-gray-400 font-bold hover:text-main-green transition-colors text-sm"
                    >
                        Back to login
                    </Link>
                )}
            </motion.div>
        </div>
    );
}

export default function BorrowerResetPasscodePage() {
    return (
        <Suspense fallback={<SuspenseLoader />}>
            <BorrowerResetPasscodeForm />
        </Suspense>
    );
}
