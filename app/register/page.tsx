"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Github, Globe, Chrome } from "lucide-react";
import Image from "next/image";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
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
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#d7e9d1]">
            {/* Left Side: Illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center h-screen relative overflow-hidden">
                <div
                    className="relative w-full h-full"
                >
                    <Image
                        src="/register-illustration.png"
                        alt="Workspace Illustration"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center">
                <div className="w-full max-w-[550px] h-[90vh] overflow-y-auto bg-white rounded-[40px] p-8 lg:p-16 shadow-xl flex flex-col items-center">
                    {/* Logo */}
                    <Link href="/" className="mb-10 flex items-center gap-2">
                        <div className="size-8 bg-main-green rounded-lg flex items-center justify-center">
                            <span className="text-lemon-primary font-black text-xl">P</span>
                        </div>
                        <span className="text-2xl font-black text-main-green tracking-tight">PadiLoan</span>
                    </Link>

                    <h1 className="text-4xl font-black text-[#1F4941] mb-8 text-center leading-tight">
                        Create <br /> account
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        <div>
                            <Input
                                placeholder="Full Name"
                                className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium"
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                placeholder="Email address"
                                type="email"
                                className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                placeholder="Phone Number"
                                type="tel"
                                className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium"
                                {...register("phone")}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 ml-2">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            disabled={isLoading}
                            className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-4 shadow-lg shadow-lemon-primary/20 transition-transform active:scale-[0.98]"
                            type="submit"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create account"}
                        </Button>
                    </form>

                    <div className="mt-8 mb-8 flex flex-col items-center w-full">
                        <div className="flex items-center gap-4 w-full mb-6">
                            <div className="h-px bg-gray-100 flex-1"></div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or sign up with</span>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>

                        <div className="flex gap-4">
                            <button className="size-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                                <Chrome size={20} className="text-gray-600" />
                            </button>
                            <button className="size-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                                <Globe size={20} className="text-gray-600" />
                            </button>
                            <button className="size-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
                                <Github size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 italic">
                            By creating an account you agree to PadiLoan's{" "}
                            <Link href="/terms" className="text-main-green underline">Terms of Services</Link> and{" "}
                            <Link href="/privacy" className="text-main-green underline">Privacy Policy</Link>.
                        </p>
                    </div>

                    <div className="mt-12 text-sm">
                        <span className="text-gray-400 font-bold italic">Have an account? </span>
                        <Link href="/login" className="text-main-green font-black hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}