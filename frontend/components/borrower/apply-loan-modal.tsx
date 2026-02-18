"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../../hooks/use-debounce";

interface LoanApp {
    id: string;
    name: string;
    slug: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    interestRate: number;
    tenure: string;
    logo?: string;
}

interface ApplyLoanModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userPhone?: string;
}

export function ApplyLoanModal({ open, onOpenChange, userPhone }: ApplyLoanModalProps) {
    const router = useRouter();
    const [slug, setSlug] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [loanApp, setLoanApp] = useState<LoanApp | null>(null);
    const [error, setError] = useState<string | null>(null);

    const debouncedSlug = useDebounce(slug, 500);

    // Format slug with dashes
    const formatSlug = (value: string) => {
        return value
            .toLowerCase()
        // .replace(/\s+/g, "-")
        // .replace(/[^a-z0-9-]/g, "");
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatSlug(e.target.value);
        setSlug(formatted);
        setError(null);
        setLoanApp(null);
    };

    useEffect(() => {
        if (!debouncedSlug || debouncedSlug.length < 2) {
            setLoanApp(null);
            setError(null);
            return;
        }

        async function checkSlug() {
            setIsChecking(true);
            setError(null);

            try {
                const res = await fetch(`/api/loan-apps/${debouncedSlug}`);

                if (res.ok) {
                    const data = await res.json();
                    setLoanApp(data);
                    setError(null);
                } else if (res.status === 404) {
                    setLoanApp(null);
                    setError("Loan app not found");
                } else {
                    setLoanApp(null);
                    setError("Failed to check availability");
                }
            } catch (err) {
                setLoanApp(null);
                setError("Network error");
            } finally {
                setIsChecking(false);
            }
        }

        checkSlug();
    }, [debouncedSlug]);

    const handleApply = () => {
        if (!loanApp || !userPhone) return;

        // Store phone in localStorage for the application flow
        localStorage.setItem("borrower_phone", userPhone);

        // Navigate to the loan application page at the offer stage
        router.push(`/apply/${loanApp.slug}?phone=${encodeURIComponent(userPhone)}&stage=offer`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-[32px] p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-main-green text-center mb-2">
                        Apply for a Loan
                    </DialogTitle>
                    <p className="text-gray-500 text-center text-sm">
                        Enter the loan app code or name to get started
                    </p>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">
                            Loan App Code
                        </label>
                        <div className="relative">
                            <Input
                                value={slug}
                                onChange={handleSlugChange}
                                placeholder="e.g., quick-cash or salary-advance"
                                className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 pr-12"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isChecking && <Loader2 className="animate-spin text-gray-400" size={20} />}
                                {!isChecking && loanApp && <CheckCircle2 className="text-green-500" size={20} />}
                                {!isChecking && error && slug.length > 0 && <XCircle className="text-red-500" size={20} />}
                            </div>
                        </div>
                        {error && slug.length > 0 && (
                            <p className="text-red-500 text-xs ml-2">{error}</p>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {loanApp && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-gradient-to-br from-main-green to-main-green/80 p-6 rounded-[32px] text-white space-y-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black mb-1">{loanApp.name}</h3>
                                        <p className="text-white/80 text-sm">{loanApp.description}</p>
                                    </div>
                                    {loanApp.logo && (
                                        <img
                                            src={loanApp.logo}
                                            alt={loanApp.name}
                                            className="size-12 rounded-xl bg-white/10 object-cover"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                                    <div>
                                        <p className="text-white/60 text-xs font-bold mb-1">Loan Range</p>
                                        <p className="font-black">
                                            ₦{loanApp.minAmount.toLocaleString()} - ₦{loanApp.maxAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-xs font-bold mb-1">Interest Rate</p>
                                        <p className="font-black">{loanApp.interestRate}% per {loanApp.tenure}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleApply}
                                    className="w-full h-14 bg-lemon-primary text-black hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-4 shadow-lg"
                                >
                                    Apply Now <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!loanApp && !error && slug.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic text-sm">
                            Start typing to search for available loan apps
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
