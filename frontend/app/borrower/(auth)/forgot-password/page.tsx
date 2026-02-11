"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

const forgotSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function BorrowerForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotSchema),
    });

    async function onSubmit(values: any) {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSuccess(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            toast.error("Failed to send reset link");
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
                    <Mail size={32} />
                </div>

                {!isSuccess ? (
                    <>
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2 text-center">Forgot Password?</h1>
                        <p className="text-gray-500 mb-8 text-center text-sm">Enter your email address and we'll send you a link to reset your password.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                            <div>
                                <Input
                                    {...register("email")}
                                    placeholder="Email address"
                                    className="h-14 bg-[#f8fbf7] rounded-2xl px-6"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 ml-2">{errors.email.message as string}</p>}
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
                ) : (
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-[#1F4941] mb-2">Check your email</h1>
                        <p className="text-gray-500 mb-8 text-sm">We've sent a password reset link to your email address.</p>
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-bold"
                            onClick={() => setIsSuccess(false)}
                        >
                            Resend link
                        </Button>
                    </div>
                )}

                <Link href="/borrower/login" className="flex items-center gap-2 mt-8 text-gray-400 font-bold hover:text-main-green transition-colors">
                    <ArrowLeft size={16} />
                    Back to login
                </Link>
            </motion.div>
        </div>
    );
}
