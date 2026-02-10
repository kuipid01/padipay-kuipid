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
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  passcode: z.string().length(6, "Passcode must be exactly 6 digits"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      passcode: "",
    },
  });


  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log("values", values);
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
      <div className="flex items-center  justify-center  relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-[500px] h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-[40px] p-8 lg:p-16 shadow-2xl flex flex-col items-center border border-white/50 backdrop-blur-sm"
        >
          {/* Logo */}
          <Link
            href="/"
            className="mb-10 flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="size-8 bg-main-green rounded-lg flex items-center justify-center shadow-lg shadow-main-green/20">
              <span className="text-lemon-primary font-black text-xl">P</span>
            </div>
            <span className="text-2xl font-black text-main-green tracking-tight">
              PadiLoan
            </span>
          </Link>

          <h1 className="text-4xl font-black text-[#1F4941] mb-8 text-center leading-tight">
            Welcome Back
          </h1>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <div className="relative group">
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Phone Number (e.g. 080...)"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium transition-all group-hover:border-main-green/30"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="passcode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1.5">
                  <div className="relative group">
                    <Input
                      {...field}
                      id={field.name}
                      type={showPasscode ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-Digit Passcode"
                      aria-invalid={fieldState.invalid}
                      className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 focus-visible:ring-main-green font-medium transition-all group-hover:border-main-green/30 tracking-widest text-center text-lg"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(val);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex justify-end px-1 mt-1">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-400 font-bold hover:text-main-green transition-colors"
                    >
                      Forgot passcode?
                    </Link>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              disabled={isLoading}
              className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-2 shadow-lg shadow-lemon-primary/20 transition-all active:scale-[0.98] hover:shadow-xl hover:-translate-y-0.5"
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <div className="mt-4 mb-4 flex flex-col items-center w-full">
            {/* Removed Social Login for simplified flow or keep if needed? User specifically mentioned phone/passcode. I'll keep it as "or sign in with" is usually harmless, but the user was specific. I will comment it out to be safe or keep it. Let's keep it as standard login page usually has options. Actually, I removed it in the requested block because I want to stick to what was requested "login with phone number and passcode". But standard designs usually have alternatives. I will remove the social login block to keep it clean and focused as requested "simple button... can just login". Wait, standard login pages often have social. I'll remove it to be safe and specific to the request "login with phone number and passcode". */}
          </div>

          <div className="text-center mt-4">
            <p className="text-xs font-bold text-gray-400 italic">
              By logging in you agree to PadiLoan's{" "}
              <Link href="/terms" className="text-main-green underline">
                Terms of Services
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-main-green underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="mt-12 text-sm">
            <span className="text-gray-400 font-bold italic">
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className="text-main-green font-black hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
