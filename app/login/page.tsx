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
import { Loader2, Eye, EyeOff, Github, Globe, Chrome } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        console.log("values", values)
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            toast.success("Welcome back!");
            router.push("/dashboard");
            router.refresh();
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
                        src="/login-illustration.png"
                        alt="Workspace Illustration"
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
            <div className="flex items-center  justify-center  relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-[500px] h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-[40px] p-8 lg:p-16 shadow-2xl flex flex-col items-center border border-white/50 backdrop-blur-sm"
                >
                    {/* Logo */}
                    <Link href="/" className="mb-10 flex items-center gap-2 group transition-transform hover:scale-105">
                        <div className="size-8 bg-main-green rounded-lg flex items-center justify-center shadow-lg shadow-main-green/20">
                            <span className="text-lemon-primary font-black text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black text-main-green tracking-tight">PadiLoan</span>
                    </Link>

                    <h1 className="text-4xl font-black text-[#1F4941] mb-8 text-center leading-tight">
                        Welcome Back
                    </h1>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
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

                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                    <div className="relative group">
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            aria-invalid={fieldState.invalid}
                                            className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium transition-all group-hover:border-main-green/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end px-1 mt-1">
                                        <Link href="/forgot-password" className="text-xs text-gray-400 font-bold hover:text-main-green transition-colors">
                                            Forgot password?
                                        </Link>
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
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Log in"}
                        </Button>
                    </form>

                    <div className="mt-4 mb-4 flex flex-col items-center w-full">
                        <div className="flex items-center gap-4 w-full mb-6">
                            <div className="h-px bg-gray-100 flex-1"></div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or sign in with</span>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>

                        <div className="flex gap-4">
                            {[Chrome, Globe, Github].map((Icon, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="size-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-white hover:shadow-md transition-all group"
                                >
                                    <Icon size={20} className="text-gray-600 group-hover:text-main-green transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 italic">
                            By logging in you agree to PadiLoan's{" "}
                            <Link href="/terms" className="text-main-green underline">Terms of Services</Link> and{" "}
                            <Link href="/privacy" className="text-main-green underline">Privacy Policy</Link>.
                        </p>
                    </div>

                    <div className="mt-12 text-sm">
                        <span className="text-gray-400 font-bold italic">Don't have an account? </span>
                        <Link href="/register" className="text-main-green font-black hover:underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
