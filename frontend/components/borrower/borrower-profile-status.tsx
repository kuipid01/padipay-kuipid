"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserCheck,
    ChevronDown,
    MapPin,
    CreditCard,
    ShieldCheck,
    Mail,
    Phone,
    Building,
    Calendar,
    BadgeCheck,
    ArrowRight,
    UserMinus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Borrower } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { ConfirmBankModal } from "./confirm-bank-modal";

interface BorrowerProfileStatusProps {
    borrower: Borrower;
    onConsent?: (consent: boolean) => void;
}

export const BorrowerProfileStatus: React.FC<BorrowerProfileStatusProps> = ({ borrower, onConsent }) => {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleAction = async (consent: boolean) => {
        if (!consent) {
            if (onConsent) onConsent(false);
            return;
        }

        // If confirming, check for bank accounts first
        if (borrower.bankAccounts && borrower.bankAccounts.length > 0) {
            setShowBankModal(true);
        } else if (onConsent) {
            onConsent(true);
        }
    };

    const handleConfirmBank = () => {
        setShowBankModal(false);
        if (onConsent) onConsent(true);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen w-full bg-gray-50/50 py-12 md:py-20">
            <div className="w-full max-w-4xl mx-auto px-4">
                {/* --- Hero Logo Section (Hidden on Expand) --- */}
                <AnimatePresence>
                    {!isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center mb-12 text-center"
                        >
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-main-green/20 blur-3xl rounded-full scale-150" />
                                <div className="relative size-24 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center text-main-green">
                                    <ShieldCheck size={48} strokeWidth={1.5} />
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-2 -right-2 bg-main-green text-white size-8 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white"
                                >
                                    <BadgeCheck size={18} />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                                Review Your Profile
                            </h2>
                            <p className="text-gray-500 font-medium max-w-sm">
                                We've prepared your information for the loan application. Please confirm everything is correct.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                    {/* --- Main Header Card --- */}
                    <div className="p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className="relative">
                                <div className="size-16 rounded-2xl bg-main-green/5 flex items-center justify-center text-main-green shrink-0">
                                    <UserCheck size={32} />
                                </div>
                                {borrower.kycVerified && (
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                        <BadgeCheck className="text-blue-500 size-6 fill-blue-50" />
                                    </div>
                                )}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -bottom-1 -right-1 size-3 bg-main-green rounded-full border-2 border-white"
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 leading-tight">
                                    Hi, {borrower.firstName}!
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    We've automatically loaded your profile.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-main-green transition-colors px-4 h-14 rounded-2xl"
                            >
                                {isExpanded ? "Close Details" : "Review Profile"}
                            </button>

                            <button
                                onClick={() => handleAction(true)}
                                className="group flex items-center gap-3 bg-main-green text-white font-black text-xs uppercase tracking-[0.15em] px-10 py-5 rounded-[20px] hover:bg-main-green/90 transition-all shadow-xl shadow-main-green/20 active:scale-95"
                            >
                                Confirm & Continue
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* --- Expandable Content --- */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="px-8 pb-8 space-y-8 border-t border-gray-50 bg-gray-50/30">
                                    <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Personal Info */}
                                        <Section title="Personal" icon={<Mail size={12} />}>
                                            <DetailItem label="Email" value={borrower.email} />
                                            <DetailItem label="Phone" value={borrower.phone} />
                                            <DetailItem label="Birthday" value={formatDate(borrower.dob)} />
                                        </Section>

                                        {/* Location */}
                                        <Section title="Address" icon={<MapPin size={12} />}>
                                            <DetailItem label="Street" value={borrower.address || "N/A"} />
                                            <div className="flex gap-4">
                                                <DetailItem label="City" value={borrower.city || "N/A"} />
                                                <DetailItem label="Country" value={borrower.country} />
                                            </div>
                                        </Section>

                                        {/* Security/KYC */}
                                        <Section title="Security" icon={<ShieldCheck size={12} />}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KYC Status</span>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase",
                                                    borrower.kycVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                                )}>
                                                    <div className={cn("size-1.5 rounded-full", borrower.kycVerified ? "bg-green-500" : "bg-orange-500")} />
                                                    {borrower.kycVerified ? "Verified" : "Action Needed"}
                                                </div>
                                            </div>
                                            <DetailItem label="BVN" value={borrower.bvn ? `•••• ${borrower.bvn.slice(-4)}` : "Not Linked"} />
                                            <DetailItem label="Accounts" value={`${borrower.bankAccounts?.length || 0} Linked`} />
                                        </Section>
                                    </div>

                                    {/* Bank Badges */}
                                    {borrower.bankAccounts && borrower.bankAccounts.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                            {borrower.bankAccounts.map((acc: any, i: number) => (
                                                <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                                                    <Building size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-900 leading-none">{acc.bankName}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">**** {acc.accountNumber.slice(-4)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bottom Actions */}
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100/50">
                                        <div className="flex items-center gap-4 text-gray-400 bg-white px-5 py-3 rounded-2xl border border-gray-50">
                                            <UserMinus size={18} />
                                            <p className="text-sm font-semibold">
                                                Not you? <button onClick={() => handleAction(false)} className="text-main-green font-black hover:underline underline-offset-4">Sign out</button>
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mr-2">Need to change something?</p>
                                            <button
                                                onClick={() => router.push("/borrower/dashboard")}
                                                className="group flex items-center gap-2 bg-lemon-primary/20 text-main-green font-black text-[11px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-lemon-primary/30 transition-all border border-lemon-primary/30"
                                            >
                                                Proceed to Dashboard
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <ConfirmBankModal 
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                onConfirm={handleConfirmBank}
                bankAccounts={borrower.bankAccounts || []}
            />
        </div>


    );
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-main-green/60">
            {icon} {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-white/50 border border-gray-100/50 p-3 rounded-xl">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-xs font-bold text-gray-700 truncate">{value}</p>
    </div>
);