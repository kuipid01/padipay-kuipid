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
        <div className="min-h-screen bg-white lg:bg-main-green flex overflow-hidden lg:flex-row flex-col">
            {/* Background Mesh Gradient (Universal) */}
            <div className="fixed inset-0 lg:w-[40%] bg-main-green pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#BDF49D_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#1F4941_0%,transparent_50%)] blur-[100px] opacity-40 lg:opacity-20" />
            </div>

            {/* Left Side: Branding and Hero (Desktop Only) */}
            <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-12 overflow-hidden z-10">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-24">
                        <Image src="/logo.svg" alt="Logo" width={50} height={50} />
                        <span className="font-bold text-white uppercase text-3xl">My</span>
                        <span className="font-extrabold text-lemon-primary uppercase -ml-3 text-4xl">Cash</span>
                        <span className="font-bold text-white uppercase -ml-3 text-3xl">NG</span>
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
            <div className="flex-1 flex flex-col relative overflow-y-auto bg-transparent z-10">
                {/* Mobile Logo Section */}
                <div className="lg:hidden flex justify-center pt-12 pb-6">
                    <div className="flex items-center gap-1.5 grayscale-0 contrast-125">
                        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                        <span className="font-bold text-white uppercase text-xl">My</span>
                        <span className="font-extrabold text-lemon-primary uppercase -ml-2 text-2xl">Cash</span>
                        <span className="font-bold text-white uppercase -ml-2 text-xl">NG</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 lg:p-20">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="form"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full lg:max-w-[580px] max-w-[420px]"
                            >
                                <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm">
                                    <motion.div variants={itemVariants} className="mb-8 block lg:hidden text-center">
                                        <h2 className="text-2xl font-black text-main-green">Create Account</h2>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="mb-10 hidden lg:block text-left">
                                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h2>
                                        <p className="text-gray-500 font-medium">
                                            Start your business journey with Padi-Loan.
                                        </p>
                                    </motion.div>

                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <motion.div variants={itemVariants}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                                Full Name
                                            </label>
                                            <Controller
                                                name="fullName"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <Input
                                                            {...field}
                                                            placeholder="John Doe"
                                                            className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                                                        />
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                                Email Address
                                            </label>
                                            <Controller
                                                name="email"
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            placeholder="name@company.com"
                                                            className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                                                        />
                                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                    </Field>
                                                )}
                                            />
                                        </motion.div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <motion.div variants={itemVariants}>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                                    Phone
                                                </label>
                                                <Controller
                                                    name="phone"
                                                    control={form.control}
                                                    render={({ field, fieldState }) => (
                                                        <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                                            <Input
                                                                {...field}
                                                                type="tel"
                                                                placeholder="080 000 0000"
                                                                className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                                                            />
                                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                        </Field>
                                                    )}
                                                />
                                            </motion.div>

                                            <motion.div variants={itemVariants}>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                                    Password
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
                                                                    placeholder="••••••••"
                                                                    className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl pl-5 pr-12 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main-green transition-colors"
                                                                >
                                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                                </button>
                                                            </div>
                                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                        </Field>
                                                    )}
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.div variants={itemVariants} className="pt-2">
                                            <Button
                                                disabled={isLoading}
                                                className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-2xl text-base font-black shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] group"
                                                type="submit"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Get Started
                                                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="pt-6 border-t border-gray-100 text-center">
                                            <p className="text-sm font-bold text-gray-500">
                                                Already have an account?{" "}
                                                <Link href="/login" className="text-main-green font-black hover:underline underline-offset-4 decoration-2">
                                                    Sign In
                                                </Link>
                                            </p>
                                        </motion.div>
                                    </form>
                                </div>

                                <motion.p variants={itemVariants} className="mt-8 text-center text-[10px] text-white/40 lg:text-gray-400 font-bold uppercase tracking-widest px-6">
                                    By signing up, you agree to Padi-Loan's{" "}
                                    <Link href="/terms" className="hover:text-white lg:hover:text-main-green transition-colors">Terms</Link> &{" "}
                                    <Link href="/privacy" className="hover:text-white lg:hover:text-main-green transition-colors">Privacy Policy</Link>
                                </motion.p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-[420px]"
                            >
                                <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 text-center backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-main-green/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 relative">
                                        <div className="absolute inset-0 bg-main-green/20 rounded-[24px] animate-ping opacity-20" />
                                        <Mail className="w-10 h-10 text-main-green relative z-10" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-4">Check your email</h2>
                                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">
                                        We've sent a verification link to <br/>
                                        <span className="text-main-green italic">{registeredEmail}</span>
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        <Button
                                            onClick={() => router.push("/login")}
                                            className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-2xl text-base font-black shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] group"
                                        >
                                            Take me to login
                                            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>

                                        <button
                                            onClick={() => setIsSuccess(false)}
                                            className="text-xs font-black uppercase text-gray-400 hover:text-main-green transition-colors"
                                        >
                                            Change email address
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
