"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side: Branding and Hero (Consistent with Register Page) */}
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
              <span className="w-1.5 h-1.5 rounded-full bg-lemon-primary" />
              Security First
            </div>
            <h1 className="text-5xl font-libreBaskerville font-black text-white leading-[1.1] mb-6">
              Verifying Your <br />
              <span className="text-lemon-primary">Identity.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              We're ensuring your account is secure. Once verified, you'll have full access to Padi-Loan's features.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between border-t border-white/10 pt-8 text-[10px] text-white/50 font-semibold uppercase tracking-wider">
            <span>© 2026 Padi-Loan. All Rights Reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Side: Verification Status */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[480px] text-center"
          >
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Loader2 className="w-10 h-10 text-main-green animate-spin" />
                  </div>
                  <motion.h2 className="text-3xl font-bold text-gray-900">
                    Verifying Email
                  </motion.h2>
                  <motion.p className="text-gray-500 font-medium">
                    Please wait while we validate your verification token...
                  </motion.p>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 bg-main-green/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10 text-main-green" />
                  </div>
                  <motion.h2 className="text-3xl font-bold text-gray-900">
                    Email Verified!
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-gray-500 font-medium leading-relaxed">
                    Welcome to the family{userData?.name ? `, ${userData.name}` : ""}! Your email {userData?.email && <span className="text-main-green font-bold">({userData.email})</span>} has been successfully verified.
                  </motion.p>

                  <motion.div className="pt-8">
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full h-14 bg-main-green hover:bg-main-green/90 text-white rounded-full text-lg font-bold shadow-xl shadow-main-green/10 transition-all active:scale-[0.98] group"
                    >
                      Continue to Login
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <motion.h2 className="text-3xl font-bold text-gray-900">
                    Verification Failed
                  </motion.h2>
                  <motion.p className="text-gray-500 font-medium whitespace-pre-wrap">
                    {errorMessage || "We couldn't verify your email address. The link may have expired or is invalid."}
                  </motion.p>

                  <motion.div className="pt-8 flex flex-col gap-4">
                    <Button
                      onClick={() => router.push("/login")}
                      variant="outline"
                      className="w-full h-14 border-gray-200 rounded-full text-lg font-bold hover:bg-gray-50"
                    >
                      <ArrowLeft className="mr-2 w-5 h-5" />
                      Back to Login
                    </Button>
                    <Link href="/support" className="text-sm font-bold text-main-green hover:underline">
                      Need help? Contact support
                    </Link>
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
