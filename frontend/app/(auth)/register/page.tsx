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
import { Loader2, Eye, EyeOff, User, Mail, Phone, Lock, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
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

            toast.success("Account created successfully!");
            const redirect = searchParams.get("redirect") || "/dashboard";
            router.push(redirect);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen font-sans overflow-hidden bg-[#FAFCF9] grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side: Illustration & Branding */}
            <div className="hidden lg:flex flex-col relative overflow-hidden bg-main-green p-12">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-lemon-primary blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lemon-primary blur-[100px]" />
                </div>

                {/* Logo or Brand Name */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-20 flex items-center gap-2 mb-20"
                >
                    <div className="w-10 h-10 bg-lemon-primary rounded-xl flex items-center justify-center">
                        <span className="text-main-green font-black text-xl">P</span>
                    </div>
                    <span className="text-white font-libreBaskerville font-bold text-2xl tracking-tight">Padi-Loan</span>
                </motion.div>

                <div className="relative z-20 mt-auto">
                    <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl font-libreBaskerville font-bold text-white leading-[1.1] mb-6"
                    >
                        Smart Financing <br /> 
                        <span className="text-lemon-primary">For Your Future.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-white/70 text-lg max-w-md mb-10"
                    >
                        Join over 50,000 users who trust Padi-Loan for their financial growth and flexible credit solutions.
                    </motion.p>

                    {/* Trust Badge/Testimonial */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex items-center gap-4 max-w-sm"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-main-green bg-gray-200 overflow-hidden">
                                     <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" width={40} height={40} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="flex gap-0.5 mb-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={12} className="fill-lemon-primary text-lemon-primary" />
                                ))}
                            </div>
                            <p className="text-white text-xs font-medium">Joined by 1.2k+ users this week</p>
                        </div>
                    </motion.div>
                </div>

                {/* Main Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/2 right-[-10%] translate-y-[-50%] w-[80%] h-[60%] z-10 hidden xl:block"
                >
                    <div className="relative w-full h-full">
                        <Image
                            src="/register-illustration.png"
                            alt="Workspace Illustration"
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 bg-white relative">
                {/* Mobile Background elements */}
                <div className="lg:hidden absolute top-0 right-0 w-32 h-32 bg-lemon-primary/20 blur-3xl rounded-full" />
                <div className="lg:hidden absolute bottom-0 left-0 w-32 h-32 bg-main-green/10 blur-3xl rounded-full" />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[480px] z-10"
                >
                    <motion.div variants={itemVariants} className="text-center mb-10">
                        <h1 className="text-4xl font-libreBaskerville font-black mb-3 text-main-green leading-tight">
                            Create Account
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Start your financial journey with Padi-Loan
                        </p>
                    </motion.div>

                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <motion.div variants={itemVariants}>
                            <Controller
                                name="fullName"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                                                <User size={20} />
                                            </div>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder="Full Name"
                                                aria-invalid={fieldState.invalid}
                                                className="h-14 bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-6 focus-visible:ring-main-green/20 focus-visible:border-main-green font-medium transition-all hover:bg-gray-100/50"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                                                <Mail size={20} />
                                            </div>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder="Email address"
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                className="h-14 bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-6 focus-visible:ring-main-green/20 focus-visible:border-main-green font-medium transition-all hover:bg-gray-100/50"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Controller
                                name="phone"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                                                <Phone size={20} />
                                            </div>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                placeholder="Phone Number"
                                                type="tel"
                                                aria-invalid={fieldState.invalid}
                                                className="h-14 bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-6 focus-visible:ring-main-green/20 focus-visible:border-main-green font-medium transition-all hover:bg-gray-100/50"
                                            />
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                                                <Lock size={20} />
                                            </div>
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                aria-invalid={fieldState.invalid}
                                                className="h-14 bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-14 focus-visible:ring-main-green/20 focus-visible:border-main-green font-medium transition-all hover:bg-gray-100/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main-green transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <Button
                                disabled={isLoading}
                                className="w-full h-14 bg-main-green text-lemon-primary hover:bg-main-green/90 rounded-2xl text-lg font-bold shadow-lg shadow-main-green/10 transition-all active:scale-[0.98] group"
                                type="submit"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Create account
                                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-8">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <span className="relative px-4 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                or sign up with
                            </span>
                        </div>

                        <button className="flex gap-3 items-center justify-center w-full h-14 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98] font-semibold text-gray-700">
                            <img height={24} width={24} src="/google.png" className="object-contain" alt="Google" />
                            Sign up with Google
                        </button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-10 text-center">
                        <p className="text-xs text-gray-400 mb-6">
                            By creating an account you agree to Padi-Loan's{" "}
                            <Link href="/terms" className="text-main-green font-bold hover:underline">
                                Terms
                            </Link>{" "}
                            &{" "}
                            <Link href="/privacy" className="text-main-green font-bold hover:underline">
                                Privacy Policy
                            </Link>
                        </p>

                        <div className="text-sm">
                            <span className="text-gray-500 font-medium tracking-tight">
                                Already have an account?{" "}
                            </span>
                            <Link
                                href="/login"
                                className="text-main-green font-black hover:underline underline-offset-4 decoration-2"
                            >
                                Log in
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
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
