"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { differenceInDays, parseISO } from "date-fns";

export function TrialStatusChecker({ inline = false }: { inline?: boolean }) {
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(false);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        // If user has an active subscription, don't show trial info
        if (user.subscriptionStatus === "active") {
            setIsVisible(false);
            return;
        }

        // Determine trial end date
        // Use trialEndsAt if available, otherwise fallback to createdAt + 30 days
        let trialEnd: Date;
        if (user.trialEndsAt) {
            trialEnd = parseISO(user.trialEndsAt);
        } else if (user.createdAt) {
            const created = parseISO(user.createdAt);
            trialEnd = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else {
            return;
        }

        const now = new Date();
        const diff = differenceInDays(trialEnd, now);

        if (diff >= 0 && diff <= 30) {
            setDaysLeft(diff);

            // Show if it's been some time since last dismissal? 
            // For now, let's just show it.
            const lastDismissed = localStorage.getItem("Kuipid_trial_check_dismissed");
            const today = new Date().toDateString();

            if (lastDismissed !== today) {
                setIsVisible(true);
            }
        }
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("Kuipid_trial_check_dismissed", new Date().toDateString());
    };

    if (!isVisible || daysLeft === null) return null;

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
                        : "pointer-events-none fixed bottom-4 right-4 z-[100] w-[calc(100vw-1.5rem)] max-w-[360px] sm:bottom-24 sm:right-5"
                    }
                >
                    <div className="pointer-events-auto relative overflow-hidden rounded-[24px] border border-gray-200/70 bg-white/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.10)] backdrop-blur-md">
                        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-main-green/10 blur-2xl" />

                        <button
                            onClick={handleClose}
                            className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex gap-3 pr-8">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-[16px] bg-lemon-primary/20 text-main-green shadow-inner">
                                <Crown size={20} />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base font-black tracking-tight text-main-green">
                                    Free Trial Active
                                </h4>
                                <p className="text-[13px] font-bold leading-snug text-gray-500">
                                    You have <span className="text-main-green">{daysLeft} days</span> left on your trial. Upgrade to a plan to enjoy uninterrupted access.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    // Trigger the upgrade modal in DashboardClientLayout
                                    // We'll need a way to communicate this or just link to settings
                                    window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
                                    handleClose();
                                }}
                                className="h-10 flex-1 rounded-2xl bg-main-green text-xs font-black text-white shadow-lg shadow-main-green/20 transition-all hover:bg-main-green/90 active:scale-95"
                            >
                                Upgrade Now
                                <ArrowUpRight size={14} className="ml-1.5" />
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="h-10 rounded-2xl px-4 text-xs font-bold text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
