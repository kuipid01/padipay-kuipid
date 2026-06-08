"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { SuspenseLoader } from "@/components/ui/suspense-loader";
import Image from "next/image";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      router.push("/forgot-password");
    }
  }, [token, router]);

  async function onSubmit(values: ResetPasswordFormData) {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset failed");
      }

      setIsSuccess(true);
      toast.success("Password reset successful!");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white lg:bg-main-green flex overflow-hidden lg:flex-row flex-col">
      {/* Background Mesh Gradient (Universal) */}
      <div className="fixed inset-0 lg:w-[40%] bg-main-green pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,#BDF49D_0%,transparent_50%),radial-gradient(circle_at_70%_70%,#1F4941_0%,transparent_50%)] blur-[100px] opacity-40 lg:opacity-20" />
      </div>

      {/* Left Side: Branding and Hero (Desktop Only) */}
      <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-12 overflow-hidden z-10">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-24 group">
            <Image src="/logo.svg" alt="Logo" width={50} height={50} className="group-hover:scale-105 transition-transform" />
            <span className="font-bold text-white uppercase text-3xl">My</span>
            <span className="font-extrabold text-lemon-primary uppercase -ml-3 text-4xl">Cash</span>
            <span className="font-bold text-white uppercase -ml-3 text-3xl">NG</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-lemon-primary animate-pulse" />
              Security Update
            </div>
            <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
              Create New <br />
              <span className="text-lemon-primary">Password.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Almost there! Set a strong password for your account to ensure your financial data remains protected.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col relative overflow-y-auto bg-transparent z-10">
        {/* Mobile Logo Section */}
        <div className="lg:hidden flex justify-center pt-12 pb-6">
          <Link href="/" className="flex items-center gap-1.5 grayscale-0 contrast-125">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="font-bold text-white uppercase text-xl">My</span>
            <span className="font-extrabold text-lemon-primary uppercase -ml-2 text-2xl">Cash</span>
            <span className="font-bold text-white uppercase -ml-2 text-xl">NG</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:max-w-[580px] max-w-[420px]"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm"
                >
                  <motion.div variants={itemVariants} className="mb-8 block lg:hidden text-center">
                    <h2 className="text-2xl font-black text-main-green">New Password</h2>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mb-10 hidden lg:block text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Set New Password</h2>
                    <p className="text-gray-500 font-medium text-sm">
                      Enter your new credentials below to regain access.
                    </p>
                  </motion.div>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
                    <motion.div variants={itemVariants}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                        New Password
                      </label>
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <div className="relative group">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main-green transition-colors p-1"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                        Confirm Password
                      </label>
                      <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <div className="relative group">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main-green transition-colors p-1"
                              >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                            Reset Password
                            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 text-center backdrop-blur-sm"
                >
                  <div className="w-20 h-20 bg-main-green/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-main-green/20 rounded-[24px] animate-ping opacity-20" />
                    <CheckCircle2 size={40} className="text-main-green relative z-10" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-4">Password reset!</h2>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10 px-4">
                    Your password has been successfully reset. Redirecting you to login...
                  </p>

                  <motion.div className="flex flex-col gap-4">
                    <Button
                      asChild
                      className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-2xl text-base font-black shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] group"
                    >
                      <Link href="/login">Go to Login Now</Link>
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

