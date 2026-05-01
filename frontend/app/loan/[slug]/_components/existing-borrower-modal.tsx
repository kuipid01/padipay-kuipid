"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogIn, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ExistingBorrowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  message?: string;
}

export function ExistingBorrowerModal({
  isOpen,
  onClose,
  slug,
  message,
}: ExistingBorrowerModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/borrower/login?redirect=/loan/${slug}`);
    onClose();
  };

  const handleSupport = () => {
    window.open("https://wa.me/your-support-number", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] overflow-hidden border-none bg-[#FDFDFD] p-0 shadow-[0_32px_64px_-12px_rgba(31,73,65,0.15)] rounded-[32px]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lemon-primary via-main-green to-lemon-primary/50" />

        <div className="p-10">
          <DialogHeader className="space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="mx-auto w-20 h-20 bg-lemon-primary/10 rounded-[28px] flex items-center justify-center mb-2 border border-lemon-primary/20 shadow-inner"
            >
              <LogIn className="w-10 h-10 text-main-green" />
            </motion.div>

            <div className="space-y-3">
              <DialogTitle className="text-3xl font-black text-center text-main-green tracking-tight leading-tight">
                Welcome Back!
              </DialogTitle>
              <DialogDescription className="text-center text-gray-500 text-base leading-relaxed px-2 font-medium">
                {message || "We already have an account with these details. Please login to continue your application."}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-4 mt-10">
            <Button
              onClick={handleLogin}
              className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-main-green/20"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Proceed to Login
            </Button>

            <Button
              variant="ghost"
              onClick={handleSupport}
              className="w-full h-14 rounded-[24px] text-main-green text-base font-bold hover:bg-main-green/5 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <div className="w-1 h-1 bg-lemon-primary rounded-full" />
            Secure Verification
            <div className="w-1 h-1 bg-lemon-primary rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
