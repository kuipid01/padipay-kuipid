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
import { Loader2, ArrowLeft, Mail, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import Image from "next/image";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSubmitted(true);
      toast.success("Reset link sent!");
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
          <Link href="/" className="flex items-center gap-2 mb-24 group">
            <Image src="/logo.svg" alt="Logo" width={50} height={50} className="group-hover:scale-105 transition-transform" />
            <span className="font-bold text-white uppercase text-3xl">My</span>
            <span className="font-extrabold text-lemon-primary uppercase -ml-3 text-4xl">Cash</span>
            <span className="font-bold text-white uppercase -ml-3 text-3xl">NG</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-lemon-primary animate-pulse" />
              Account Recovery
            </div>
            <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
              Forgot Your <br />
              <span className="text-lemon-primary">Password?</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Don't worry, it happens to the best of us. Let's get you back into your account quickly and securely.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between border-t border-white/10 pt-8 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
            <span>© 2026 Padi-Loan. All Rights Reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Side: Content */}
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
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm"
                >
                  <motion.div variants={itemVariants} className="mb-8 block lg:hidden text-center">
                    <h2 className="text-2xl font-black text-main-green">Reset Password</h2>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mb-10 hidden lg:block text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-500 font-medium">
                      Enter your email address to receive reset instructions
                    </p>
                  </motion.div>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
                    <motion.div variants={itemVariants}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                        Email address
                      </label>
                      <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <Input
                              {...field}
                              placeholder="name@company.com"
                              className="h-14 bg-gray-50/50 border-gray-200 rounded-2xl px-5 focus-visible:ring-main-green/10 focus-visible:border-main-green font-bold transition-all placeholder:text-gray-300"
                            />
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
                            Send Link
                            <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <motion.div variants={itemVariants} className="pt-6 border-t border-gray-100 text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-main-green transition-colors group"
                    >
                      <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                      Back to Login
                    </Link>
                  </motion.div>
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
                    <Mail size={40} className="text-main-green relative z-10" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-4">Check your inbox</h2>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10 px-4">
                    If an account exists for <span className="text-main-green italic">{form.getValues("email")}</span>, you'll receive a link shortly.
                  </p>

                  <motion.div variants={itemVariants} className="flex flex-col gap-4">
                    <Button
                      asChild
                      className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-2xl text-base font-black shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] group"
                    >
                      <Link href="/login">Return to Login</Link>
                    </Button>

                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs font-black uppercase text-gray-400 hover:text-main-green transition-colors"
                    >
                      Try another email
                    </button>
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

