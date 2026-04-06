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
import { Loader2, Eye, EyeOff, Phone } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { SuspenseLoader } from "@/components/ui/suspense-loader";

const loginSchema = z.object({
    phone: z
        .string()
        .min(10, "Enter a valid phone number")
        .regex(/^\+?[0-9\s\-()]+$/, "Enter a valid phone number"),
    passcode: z.string().min(4, "Passcode must be at least 4 digits"),
});

type LoginValues = z.infer<typeof loginSchema>;


function BorrowerLoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPasscode, setShowPasscode] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { phone: "", passcode: "" },
    });

    async function onSubmit(values: LoginValues) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/borrower-auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identifier: values.phone,
                    passcode: values.passcode,
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
            {/* Left panel — illustration */}
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

            {/* Right panel — form */}
            <div className="flex items-center justify-center relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-[500px] bg-white rounded-[40px] p-8 lg:p-16 shadow-2xl flex flex-col items-center"
                >
                    <Link href="/" className="mb-10 flex items-center gap-2">
                        <div className="size-8 bg-main-green rounded-lg flex items-center justify-center">
                            <span className="text-lemon-primary font-black text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black text-main-green">MyCashNG</span>
                    </Link>

                    <h1 className="text-3xl font-black text-[#1F4941] mb-2 text-center">
                        Borrower Login
                    </h1>
                    <p className="text-gray-500 mb-8 text-center text-sm">
                        Manage your loans and repayments
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        {/* Phone number */}
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

                        {/* Passcode */}
                        <div>
                            <div className="relative">
                                <Input
                                    {...register("passcode")}
                                    type={showPasscode ? "text" : "password"}
                                    placeholder="Passcode"
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
                            <div className="flex justify-end mt-1">
                                <Link
                                    href="/borrower/forgot-passcode"
                                    className="text-xs text-gray-400 font-bold hover:text-main-green transition-colors"
                                >
                                    Forgot passcode?
                                </Link>
                            </div>
                            {errors.passcode && (
                                <p className="text-red-500 text-xs mt-1 ml-2">
                                    {errors.passcode.message}
                                </p>
                            )}
                        </div>

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


export default function BorrowerLoginPage() {
    return (
        <Suspense fallback={<SuspenseLoader />}>
            <BorrowerLoginForm />
        </Suspense>
    );
}
