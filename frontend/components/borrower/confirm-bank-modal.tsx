"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bankAccounts: any[];
}

export function ConfirmBankModal({
  isOpen,
  onClose,
  onConfirm,
  bankAccounts,
}: ConfirmBankModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] overflow-hidden border-none bg-[#FDFDFD] p-0 shadow-[0_32px_64px_-12px_rgba(31,73,65,0.15)] rounded-[32px]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lemon-primary via-main-green to-lemon-primary/50" />
        
        <div className="p-10">
          <DialogHeader className="space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mb-2"
            >
              <Building className="w-10 h-10 text-main-green" />
            </motion.div>
            
            <div className="space-y-3">
              <DialogTitle className="text-3xl font-black text-center text-main-green tracking-tight leading-tight">
                Disbursement Account
              </DialogTitle>
              <DialogDescription className="text-center text-gray-500 text-base leading-relaxed font-medium">
                Please confirm the bank account where your funds will be disbursed.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-8 space-y-3">
            {bankAccounts.map((acc, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 bg-white border-2 border-main-green/10 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-main-green/5 rounded-xl flex items-center justify-center text-main-green">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{acc.bankName}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">**** {acc.accountNumber?.slice(-4) || '****'}</p>
                  </div>
                </div>
                <CheckCircle2 className="text-main-green" size={24} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 mt-10">
            <Button
              onClick={onConfirm}
              className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-main-green/20"
            >
              Confirm Bank Account
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full h-14 rounded-[24px] text-gray-400 text-base font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
