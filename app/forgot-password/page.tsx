"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setIsSubmitted(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-[#d7e9d1]/30">
            {/* Left Side: Illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-main-green/5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full h-full"
                >
                    <Image
                        src="/forgot-password-illustration.png"
                        alt="Security Illustration"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* Decorative floating elements */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 right-[20%] size-12 bg-lemon-primary/20 rounded-full blur-xl"
                />
                <motion.div
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 left-[20%] size-20 bg-main-green/10 rounded-full blur-2xl"
                />
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-[500px] h-[90vh] overflow-y-auto bg-white rounded-[40px] p-8 lg:p-16 shadow-2xl flex flex-col items-center border border-white/50 backdrop-blur-sm scrollbar-hide"
                >
                    {/* Logo */}
                    <Link href="/" className="mb-12 flex items-center gap-2 group transition-transform hover:scale-105">
                        <div className="size-8 bg-main-green rounded-lg flex items-center justify-center shadow-lg shadow-main-green/20">
                            <span className="text-lemon-primary font-black text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black text-main-green tracking-tight">PadiLoan</span>
                    </Link>

                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="text-4xl font-black text-[#1F4941] mb-4 text-center leading-tight">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-400 font-bold italic text-center mb-10 text-sm">
                                    No worries, we&apos;ll send you reset instructions.
                                </p>

                                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                                    <Controller
                                        name="email"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                <div className="relative group">
                                                    <Input
                                                        {...field}
                                                        id={field.name}
                                                        placeholder="Email address"
                                                        aria-invalid={fieldState.invalid}
                                                        className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium transition-all group-hover:border-main-green/30"
                                                    />
                                                </div>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <Button
                                        disabled={isLoading}
                                        className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-2 shadow-lg shadow-lemon-primary/20 transition-all active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5"
                                        type="submit"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset password"}
                                    </Button>
                                </form>

                                <div className="mt-12 text-sm">
                                    <Link href="/login" className="flex items-center text-main-green font-black hover:underline underline-offset-4 gap-2">
                                        <ArrowLeft size={16} /> Back to Login
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full flex flex-col items-center text-center"
                            >
                                <div className="size-20 bg-lemon-primary/20 rounded-[30px] flex items-center justify-center mb-8">
                                    <Mail size={40} className="text-main-green" />
                                </div>
                                <h1 className="text-4xl font-black text-[#1F4941] mb-4 leading-tight">
                                    Check your email
                                </h1>
                                <p className="text-gray-400 font-bold italic mb-10 text-sm px-4">
                                    If an account exists for <span className="text-main-green not-italic underline">{form.getValues("email")}</span>, you will receive a password reset link shortly.
                                </p>
                                <Button
                                    asChild
                                    className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black shadow-lg shadow-lemon-primary/20 transition-all active:scale-[0.98]"
                                >
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
