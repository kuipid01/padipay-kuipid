"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function BorrowerLoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    device: {
                        userAgent: navigator.userAgent,
                    },
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            toast.success("Welcome back!");
            const redirect = searchParams.get("redirect") || "/borrower/dashboard";
            router.push(redirect);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-[#d7e9d1]/30">
            <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-main-green/5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full"
                >
                    <Image
                        src="/login-illustration.png"
                        alt="Borrower Welcome"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            </div>

            <div className="flex items-center justify-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-[500px] bg-white rounded-[40px] p-8 lg:p-16 shadow-2xl flex flex-col items-center"
                >
                    <Link href="/" className="mb-10 flex items-center gap-2">
                        <div className="size-8 bg-main-green rounded-lg flex items-center justify-center">
                            <span className="text-lemon-primary font-black text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black text-main-green">PadiLoan</span>
                    </Link>

                    <h1 className="text-3xl font-black text-[#1F4941] mb-2 text-center">Borrower Login</h1>
                    <p className="text-gray-500 mb-8 text-center">Manage your loans and repayments</p>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input
                                        {...field}
                                        placeholder="Email address"
                                        className="h-14 bg-[#f8fbf7] rounded-2xl px-6"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            className="h-14 bg-[#f8fbf7] rounded-2xl px-6"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <Link href="/borrower/forgot-password" className="text-xs text-gray-400 font-bold hover:text-main-green">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Button
                            disabled={isLoading}
                            className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-2"
                            type="submit"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Log in"}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
