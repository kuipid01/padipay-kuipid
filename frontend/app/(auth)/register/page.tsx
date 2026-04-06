"use client";

import { Suspense, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, User, Mail, Phone, Lock, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { SuspenseLoader } from "../../../components/ui/suspense-loader";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as Easing },
    },
};

function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    async function onSubmit(values: RegisterFormData) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setRegisteredEmail(values.email);
            setIsSuccess(true);
            toast.success("Account created successfully!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side: Branding and Hero */}
            <div className="hidden lg:flex w-[40%] bg-main-green relative flex-col justify-between p-12 overflow-hidden">
                {/* Background Mesh Gradient for Premium Look */}
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#BDF49D_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#1F4941_0%,transparent_50%)] blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-24">
                        <div className="w-10 h-10 bg-lemon-primary rounded-xl flex items-center justify-center font-black text-main-green text-xl shadow-lg shadow-black/10">
                            P
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Padi-Loan</span>
                    </div>

                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-lemon-primary animate-pulse" />
                            Empowering Businesses
                        </div>
                        <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
                            Grow Money <br />
                            <span className="text-lemon-primary">in Seconds.</span>
                        </h1>
                        <p className="text-white/70 text-lg leading-relaxed font-medium">
                            Access quick, flexible loans to scale your business and manage your finances with ease. Built for speed and clarity.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex gap-2.5">
                        <div className="w-8 h-1.5 rounded-full bg-white transition-all" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-4 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                        <span>© 2026 Padi-Loan. All Rights Reserved.</span>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form / Success State */}
            <div className="flex-1 flex flex-col relative overflow-y-auto">
                <div className="absolute top-8 right-8 z-20">
                    {!isSuccess && (
                        <p className="text-sm font-medium text-gray-500 transition-opacity">
                            Already have an account?{" "}
                            <Link href="/login" className="text-main-green font-bold hover:underline underline-offset-4 decoration-2">
                                Sign In
                            </Link>
                        </p>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-center p-6 lg:p-20">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="form"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-[540px]"
                            >
                                <motion.div variants={itemVariants} className="mb-10">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                                    <p className="text-gray-500 font-medium">
                                        Start your business journey with Padi-Loan. Set up takes less than 5 minutes.
                                    </p>
                                </motion.div>

                                {/* Step Indicator Pattern */}
                                <motion.div variants={itemVariants} className="bg-gray-50/80 border border-gray-100 rounded-2xl p-6 mb-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step 1 of 1</span>
                                        <span className="text-xs font-bold text-main-green">Basic Information</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-main-green text-white text-[10px] flex items-center justify-center font-bold">1</div>
                                            <span className="text-xs font-bold text-gray-900">Basic</span>
                                        </div>
                                        <div className="h-[1px] flex-1 bg-gray-200" />
                                        <div className="flex items-center gap-2 opacity-40">
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 text-[10px] flex items-center justify-center font-bold text-gray-400">2</div>
                                            <span className="text-xs font-bold text-gray-400">Contact</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.div variants={itemVariants}>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                name="fullName"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter full name"
                                                            className="h-12 bg-white border-gray-200 rounded-xl px-4 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
                                                        />
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                                                Email address <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                name="email"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="Enter email address"
                                                            className="h-12 bg-white border-gray-200 rounded-xl px-4 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
                                                        />
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.div variants={itemVariants}>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                name="phone"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <Input
                                                            {...field}
                                                            type="tel"
                                                            placeholder="Enter phone number"
                                                            className="h-12 bg-white border-gray-200 rounded-xl px-4 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
                                                        />
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <Controller
                                                name="password"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Create password"
                                                                className="h-12 bg-white border-gray-200 rounded-xl pl-4 pr-12 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main-green transition-colors"
                                                            >
                                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                            </button>
                                                        </div>
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>
                                    </div>

                                    <motion.div variants={itemVariants} className="pt-4">
                                        <p className="text-[11px] text-gray-400 font-medium mb-8 leading-relaxed max-w-sm">
                                            By clicking Next, you agree to Padi-Loan's{" "}
                                            <Link href="/terms" className="text-main-green font-bold hover:underline">Terms</Link> &{" "}
                                            <Link href="/privacy" className="text-main-green font-bold hover:underline">Privacy Policy</Link>.
                                        </p>

                                        <div className="flex border-t border-gray-100 pt-8 items-center gap-10">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-main-green" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                <span className="text-xs font-black text-gray-700 ml-1">1/2</span>
                                            </div>

                                            <Button
                                                disabled={isLoading}
                                                className="flex-1 h-12 bg-[#2D4BF0] hover:bg-[#1e38c7] text-white rounded-full text-sm font-bold shadow-xl shadow-[#2D4BF0]/10 transition-all active:scale-[0.98] group"
                                                type="submit"
                                                style={{ backgroundColor: "#1F4941" }}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        Next
                                                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-full max-w-[480px] text-center"
                            >
                                <div className="w-20 h-20 bg-main-green/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <Mail className="w-10 h-10 text-main-green" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h2>
                                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                                    We've sent a verification link to <span className="text-main-green font-bold italic">{registeredEmail}</span>. 
                                    Please check your inbox (and spam folder) to activate your account.
                                </p>

                                <div className="flex flex-col gap-4">
                                    <Button
                                        onClick={() => router.push("/login")}
                                        className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-full text-lg font-bold shadow-xl shadow-main-green/10 transition-all active:scale-[0.98] group"
                                    >
                                        Got it, take me to login
                                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    
                                    <div className="pt-4 text-sm font-medium text-gray-400">
                                        Didn't receive the email?{" "}
                                        <button 
                                            onClick={() => setIsSuccess(false)}
                                            className="text-main-green font-bold hover:underline"
                                        >
                                            Try another email address
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<SuspenseLoader />}>
            <RegisterForm />
        </Suspense>
    );
}
