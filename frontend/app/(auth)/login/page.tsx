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
import { Loader2, Eye, EyeOff, Lock, Mail, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { SuspenseLoader } from "../../../components/ui/suspense-loader";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormData) {
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
              Secure Access
            </div>
            <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
              Welcome <br />
              <span className="text-lemon-primary">Back.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Log in to manage your loans, track your payments, and explore new financing opportunities.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between border-t border-white/10 pt-8 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
            <span>© 2026 Padi-Loan. All Rights Reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:max-w-[580px] max-w-[420px]"
          >
            <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm lg:bg-white">
              <motion.div variants={itemVariants} className="mb-8 block lg:hidden text-center">
                <h2 className="text-2xl font-black text-main-green">Sign In</h2>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-10 hidden lg:block text-left">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign in to Padi-Loan</h2>
                <p className="text-gray-500 font-medium">
                  Enter your credentials to access your account securely.
                </p>
              </motion.div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                    Email address
                  </label>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="gap-1.5">
                        <div className="relative">
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@company.com"
                            className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                          />
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[10px] font-black uppercase text-main-green hover:underline">
                      Forgot?
                    </Link>
                  </div>
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
                        Sign In
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm font-bold text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-main-green font-black hover:underline underline-offset-4 decoration-2">
                      Sign Up
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>

            <motion.p variants={itemVariants} className="mt-8 text-center text-[10px] text-white/40 lg:text-gray-400 font-bold uppercase tracking-widest px-6">
              By signing in, you agree to Padi-Loan's{" "}
              <Link href="/terms" className="hover:text-white lg:hover:text-main-green transition-colors">Terms</Link> &{" "}
              <Link href="/privacy" className="hover:text-white lg:hover:text-main-green transition-colors">Privacy Policy</Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <LoginForm />
    </Suspense>
  );
}


