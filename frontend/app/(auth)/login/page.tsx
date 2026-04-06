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
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side: Branding and Hero */}
      <div className="hidden lg:flex w-[40%] bg-main-green relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Mesh Gradient */}
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
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute top-15 right-8 z-20">
          <p className="text-sm font-medium text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-main-green font-bold hover:underline underline-offset-4 decoration-2">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-start p-6 lg:py-30 lg:px-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:max-w-full max-w-[580px]"
          >
            <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign in to Padi-Loan</h2>
              <p className="text-gray-500 font-medium">
                Enter your credentials to access your account securely.
              </p>
            </motion.div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
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
                          placeholder="Enter your email"
                          className="h-14 bg-white border-gray-200 rounded-xl px-4 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-bold text-main-green hover:underline">
                    Forgot password?
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
                          placeholder="Enter your password"
                          className="h-14 bg-white border-gray-200 rounded-xl pl-4 pr-12 focus-visible:ring-main-green/10 focus-visible:border-main-green font-medium transition-all"
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

              <motion.div variants={itemVariants} className="pt-4">
                <Button
                  disabled={isLoading}
                  className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-full text-lg font-bold shadow-xl shadow-main-green/10 transition-all active:scale-[0.98] group"
                  type="submit"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-8 text-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  By signing in, you agree to Padi-Loan's{" "}
                  <Link href="/terms" className="text-main-green font-bold hover:underline">Terms</Link> &{" "}
                  <Link href="/privacy" className="text-main-green font-bold hover:underline">Privacy Policy</Link>.
                </p>
              </motion.div>
            </form>
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


