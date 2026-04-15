"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";

interface WalletBalances {
    balance: number;
    locked_balance: number;
    available_balance: number;
}

const CHECK_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
const STORAGE_KEY = "padipay_last_funding_check";
const LOW_BALANCE_THRESHOLD = 2000000; // 20,000 Naira in kobo

export function FundingStatusChecker({ inline = false }: { inline?: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const [statusType, setStatusType] = useState<"low" | "empty">("low");
    const [shouldFetch, setShouldFetch] = useState(false);

    useEffect(() => {
        const lastCheck = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        console.log("[FundingStatusChecker] Initializing check", {
            lastCheck,
            now,
            diff: lastCheck ? now - parseInt(lastCheck) : null,
            checkInterval: CHECK_INTERVAL,
        });

        if (!lastCheck || now - parseInt(lastCheck) > CHECK_INTERVAL) {
            console.log("[FundingStatusChecker] Triggering fetch");
            setShouldFetch(true);
        } else {
            console.log("[FundingStatusChecker] Skipping fetch due to interval");
        }
    }, []);

    const { data: balances, isLoading, isError, error } = useQuery<WalletBalances | null>({
        queryKey: ["wallet-balances-check"],
        queryFn: async () => {
            console.log("[FundingStatusChecker] Fetching wallet balances");

            const res = await fetch("/api/lender/wallet");

            console.log("[FundingStatusChecker] Wallet API response", {
                ok: res.ok,
                status: res.status,
                statusText: res.statusText,
            });

            if (!res.ok) {
                console.log("[FundingStatusChecker] Wallet API request failed");
                return null;
            }

            const data = await res.json();

            console.log("[FundingStatusChecker] Wallet balances received", data);

            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            console.log("[FundingStatusChecker] Updated last check timestamp");

            return data;
        },
        enabled: shouldFetch,
        staleTime: CHECK_INTERVAL,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (isLoading) {
            console.log("[FundingStatusChecker] Query loading");
        }
    }, [isLoading]);

    useEffect(() => {
        if (isError) {
            console.log("[FundingStatusChecker] Query error", error);
        }
    }, [isError, error]);

    useEffect(() => {
        if (balances) {
            const available = balances.available_balance || 0;

            console.log("[FundingStatusChecker] Evaluating balance state", {
                available,
                threshold: LOW_BALANCE_THRESHOLD,
            });

            if (available === 0) {
                console.log("[FundingStatusChecker] Wallet empty. Showing popup");
                setStatusType("empty");
                setIsVisible(true);
            } else if (available < LOW_BALANCE_THRESHOLD) {
                console.log("[FundingStatusChecker] Wallet low. Showing popup");
                setStatusType("low");
                setIsVisible(true);
            } else {
                console.log("[FundingStatusChecker] Wallet balance is healthy. No popup");
            }
        }
    }, [balances]);

    const handleClose = () => {
        console.log("[FundingStatusChecker] Popup dismissed");
        setIsVisible(false);
    };

    const handleFundNow = () => {
        console.log("[FundingStatusChecker] Fund Now clicked");
        setIsVisible(false);
    };

    const handleLater = () => {
        console.log("[FundingStatusChecker] Later clicked");
        setIsVisible(false);
    };

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