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
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SuspenseLoader } from "@/components/ui/suspense-loader";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
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

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
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
    <div className="h-screen font-libreBaskerville overflow-hidden bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full h-full p-3"
        >
          <div className="relative w-full h-full">
            <Image
              src="/reset-password-illustration.png"
              alt="Reset Password Illustration"
              fill
              className="object-cover w-full h-full rounded-[20px]"
              priority
            />
          </div>
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-[20%] size-12 bg-lemon-primary/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 left-[20%] size-20 bg-main-green/10 rounded-full blur-2xl"
        />
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[600px] h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-[40px] p-8 lg:p-16 flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="text-4xl font-black mb-3 text-center leading-tight">
                  Set New Password
                </h1>
                <p className="text-gray-500 mb-8 text-center">
                  Please enter your new password below to reset your account access
                </p>

                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
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
                            placeholder="New Password"
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
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="gap-1.5">
                        <div className="relative group">
                          <Input
                            {...field}
                            id={field.name}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            aria-invalid={fieldState.invalid}
                            className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium transition-all group-hover:border-main-green/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
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
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset Password"}
                  </Button>
                </form>

                <div className="mt-12 text-sm">
                  <span className="text-gray-400 font-bold italic">Remember your password? </span>
                  <Link
                    href="/login"
                    className="text-main-green font-black hover:underline underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center text-center"
              >
                <div className="size-24 bg-lemon-primary/20 rounded-[40px] flex items-center justify-center mb-8">
                  <CheckCircle2 size={48} className="text-main-green" />
                </div>
                <h1 className="text-4xl font-black mb-3 leading-tight">
                  Password Reset!
                </h1>
                <p className="text-gray-500 mb-10 text-center">
                  Your password has been successfully reset. You can now log in with your new credentials.
                </p>
                <Button
                  asChild
                  className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black shadow-lg shadow-lemon-primary/20 transition-all active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Link href="/login">Go to Login</Link>
                </Button>
                <p className="mt-8 text-sm text-gray-400 font-bold italic">
                  Redirecting to login page in a few seconds...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-12 text-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-loose">
              Security by MyCashNG Auth System
            </p>
          </div>
        </motion.div>
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