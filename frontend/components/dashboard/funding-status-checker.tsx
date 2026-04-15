"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";

const LOW_BALANCE_THRESHOLD = 2000000; // 20,000 Naira in kobo

export function FundingStatusChecker({ inline = false }: { inline?: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const [statusType, setStatusType] = useState<"low" | "empty">("low");
    const { data: balances, isLoading } = useWallet();

    useEffect(() => {
        if (balances) {
            const available = balances.available_balance || 0;

            console.log("[FundingStatusChecker] Evaluating balance state", {
                available,
                threshold: LOW_BALANCE_THRESHOLD,
            });

            // If we have a healthy balance, never show the popup
            if (available >= LOW_BALANCE_THRESHOLD) {
                setIsVisible(false);
                return;
            }

            // Check if dismissed today
            const lastDismissed = localStorage.getItem("padipay_funding_dismissed_at");
            const today = new Date().toDateString();
            
            if (lastDismissed === today) {
                return;
            }

            if (available === 0) {
                setStatusType("empty");
                setIsVisible(true);
            } else if (available < LOW_BALANCE_THRESHOLD) {
                setStatusType("low");
                setIsVisible(true);
            }
        }
    }, [balances]);

    const handleClose = () => {
        setIsVisible(false);
        // Persist dismissal for 24 hours
        localStorage.setItem("padipay_funding_dismissed_at", new Date().toDateString());
    };

    const handleFundNow = () => {
        setIsVisible(false);
    };

    const handleLater = () => {
        handleClose();
    };

    if (isLoading || !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 16, x: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, x: 12, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={inline 
                        ? "pointer-events-none w-full max-w-[360px]"
                        : "pointer-events-none fixed bottom-4 right-4 z-[100] w-[calc(100vw-1.5rem)] max-w-[360px] sm:bottom-5 sm:right-5"
                    }
                >
                    <div className="pointer-events-auto relative overflow-hidden rounded-[24px] border border-gray-200/70 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.10)] backdrop-blur-md">
                        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-lemon-primary/10 blur-2xl transition-colors duration-500" />

                        <button
                            onClick={handleClose}
                            className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close funding status popup"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex gap-3 pr-8">
                            <div
                                className={`flex size-11 shrink-0 items-center justify-center rounded-[16px] shadow-inner ${statusType === "empty"
                                        ? "bg-red-50 text-red-500"
                                        : "bg-orange-50 text-orange-400"
                                    }`}
                            >
                                {statusType === "empty" ? (
                                    <AlertTriangle size={20} />
                                ) : (
                                    <Wallet size={20} />
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base font-black tracking-tight text-main-green">
                                    {statusType === "empty" ? "Wallet Empty" : "Low Balance"}
                                </h4>
                                <p className="text-[13px] font-bold leading-snug text-gray-500">
                                    {statusType === "empty"
                                        ? "Your wallet is currently empty. Fund now to enable disbursements."
                                        : "Your balance is below ₦20,000. Fund now to avoid interruptions."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                            <Link
                                href="/dashboard/wallet"
                                className="flex-1"
                                onClick={handleFundNow}
                            >
                                <Button className="h-10 w-full rounded-2xl bg-main-green text-xs font-black text-white shadow-lg shadow-main-green/20 transition-all hover:bg-main-green/90 active:scale-95">
                                    Fund Now
                                    <ArrowUpRight size={14} className="ml-1.5" />
                                </Button>
                            </Link>

                            <Button
                                variant="ghost"
                                onClick={handleLater}
                                className="h-10 rounded-2xl px-4 text-xs font-bold text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                            >
                                Later
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}