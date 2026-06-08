"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Verification token is missing.");
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setUserData(data.user || data);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to verify email.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }

    verifyToken();
  }, [token]);

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
              Security First
            </div>
            <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
              Verifying Your <br />
              <span className="text-lemon-primary">Identity.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              We're ensuring your account is secure. Once verified, you'll have full access to Kuipid's features.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between border-t border-white/10 pt-8 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
            <span>© 2026 Kuipid. All Rights Reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Side: Verification Status */}
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
            <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100/50 backdrop-blur-sm text-center">
              <AnimatePresence mode="wait">
                {status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-6"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                      <Loader2 className="w-10 h-10 text-main-green animate-spin" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verifying Email</h2>
                    <p className="text-sm text-gray-500 font-bold">
                      Please wait while we validate your token...
                    </p>
                  </motion.div>
                )}

                {status === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4"
                  >
                    <div className="w-20 h-20 bg-main-green/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 relative">
                      <div className="absolute inset-0 bg-main-green/20 rounded-[24px] animate-ping opacity-20" />
                      <CheckCircle2 className="w-10 h-10 text-main-green relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Email Verified!</h2>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10">
                      Welcome family! Your account is now active and ready for use.
                    </p>

                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-2xl text-base font-black shadow-xl shadow-main-green/20 transition-all active:scale-[0.98] group"
                    >
                      Go to Login
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4"
                  >
                    <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Verification Failed</h2>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-10 px-4">
                      {errorMessage || "This link may have expired or is invalid."}
                    </p>

                    <div className="flex flex-col gap-4">
                      <Button
                        onClick={() => router.push("/login")}
                        variant="outline"
                        className="w-full h-14 border-gray-200 rounded-2xl text-base font-black hover:bg-gray-50 transition-all"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back to Login
                      </Button>
                      <Link href="/support" className="text-xs font-black uppercase text-main-green hover:underline">
                        Contact Support
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-10 h-10 text-main-green animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
