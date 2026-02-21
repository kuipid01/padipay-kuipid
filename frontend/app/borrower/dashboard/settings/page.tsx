"use client";

import { useState, useEffect } from "react";
import { Settings, Lock, Landmark, Loader2, Plus, Trash2, ChevronDown, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function BorrowerSettingsPage() {
    const [activeTab, setActiveTab] = useState<"security" | "banking">("security");

    const tabs = [
        { id: "security", label: "Security", icon: Lock },
        { id: "banking", label: "Banking", icon: Landmark },
    ] as const;

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center gap-3">
                <div className="size-12 bg-lemon-primary/10 text-main-green rounded-2xl flex items-center justify-center">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-main-green">Settings</h1>
                    <p className="text-gray-500">Manage your account security and payout methods.</p>
                </div>
            </div>

            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative",
                            activeTab === tab.id
                                ? "text-main-green"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-settings-tab"
                                className="absolute inset-0 bg-white shadow-sm rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon size={18} className="relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "security" ? <SecurityTab /> : <BankingTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

const isSixDigitNumber = (value: string) => /^\d{6}$/.test(value);
function SecurityTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const isNewPassValid = isSixDigitNumber(formData.newPassword);
    const isConfirmValid =
        formData.confirmPassword.length === 6 &&
        formData.newPassword === formData.confirmPassword;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!isNewPassValid) {
            toast.error("Passcode must be exactly 6 digits");
            return;
        }

        if (!isConfirmValid) {
            toast.error("Passcodes do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/borrower/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            toast.success("Passcode updated successfully");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleNumericInput = (key: keyof typeof formData, value: string) => {
        if (/^\d*$/.test(value) && value.length <= 6) {
            setFormData({ ...formData, [key]: value });
        }
    };

    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div>
                <h3 className="text-xl font-black text-main-green mb-2">
                    Change Passcode
                </h3>
                <p className="text-gray-500 text-sm">
                    Your passcode must be 6 digits.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {/* Current */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                        Current Passcode
                    </label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••••"
                        className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6"
                        value={formData.currentPassword}
                        onChange={(e) =>
                            handleNumericInput("currentPassword", e.target.value)
                        }
                        required
                    />
                </div>

                {/* New */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                        New Passcode
                    </label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••••"
                        className={`h-14 rounded-2xl px-6 ${formData.newPassword.length === 0
                            ? "bg-[#f8fbf7] border-gray-100"
                            : isNewPassValid
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            }`}
                        value={formData.newPassword}
                        onChange={(e) =>
                            handleNumericInput("newPassword", e.target.value)
                        }
                        required
                    />
                    <p className="text-xs ml-2 text-gray-500">
                        {isNewPassValid
                            ? "✔ Valid passcode"
                            : "Must be exactly 6 digits"}
                    </p>
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                        Confirm New Passcode
                    </label>
                    <Input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••••"
                        className={`h-14 rounded-2xl px-6 ${formData.confirmPassword.length === 0
                            ? "bg-[#f8fbf7] border-gray-100"
                            : isConfirmValid
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            }`}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            handleNumericInput("confirmPassword", e.target.value)
                        }
                        required
                    />
                    {formData.confirmPassword.length > 0 && (
                        <p className="text-xs ml-2">
                            {isConfirmValid ? (
                                <span className="text-green-600">✔ Passcodes match</span>
                            ) : (
                                <span className="text-red-600">Passcodes do not match</span>
                            )}
                        </p>
                    )}
                </div>

                <Button
                    disabled={isLoading || !isNewPassValid || !isConfirmValid}
                    className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-4 shadow-lg shadow-lemon-primary/20"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Update Passcode"}
                </Button>
            </form>
        </div>
    );
}

function BankingTab() {
    const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function fetchAccounts() {
        setIsFetchingAccounts(true);
        try {
            const res = await fetch("/api/borrower/banks");
            const data = await res.json();
            if (res.ok) setSavedAccounts(data || []);
        } catch {
            // silently fail; show empty state
        } finally {
            setIsFetchingAccounts(false);
        }
    }

    useEffect(() => { fetchAccounts(); }, []);

    async function handleDelete(id: string) {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/borrower/banks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove account");
            toast.success("Bank account removed");
            setSavedAccounts((prev) => prev.filter((a) => a.id !== id));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-main-green mb-2">Payout Accounts</h3>
                        <p className="text-gray-500 text-sm">Manage where you receive your loan disbursements.</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-main-green text-white hover:bg-main-green/90 rounded-2xl px-6 h-12 font-bold shadow-lg shadow-main-green/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add New Bank
                    </Button>
                </div>

                {isFetchingAccounts ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-main-green" size={32} />
                    </div>
                ) : savedAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 italic">
                        <Landmark size={48} className="mb-4 opacity-20" />
                        <p>No payout accounts added yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAccounts.map((account) => (
                            <BankAccountCard
                                key={account.id}
                                account={account}
                                isDeleting={deletingId === account.id}
                                onDelete={() => handleDelete(account.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AddBankModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchAccounts();
                }}
            />
        </div>
    );
}

// ─── Bank Account Card ────────────────────────────────────────────────────────

interface BankAccountCardProps {
    account: any;
    isDeleting: boolean;
    onDelete: () => void;
}

function BankAccountCard({ account, isDeleting, onDelete }: BankAccountCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const masked = account.accountNumberMasked || account.accountNumber?.replace(/\d(?=\d{4})/g, "•");

    return (
        <div className="p-5 rounded-[24px] border border-gray-100 bg-gray-50 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div className="size-12 rounded-2xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                    <Landmark size={22} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-800 truncate">{account.bankName}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{masked}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5 truncate">{account.accountName}</p>
                </div>
                {!confirmDelete ? (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="size-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove account"
                    >
                        <Trash2 size={16} />
                    </button>
                ) : null}
            </div>
            {confirmDelete && (
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={onDelete}
                        className="flex-1 h-9 rounded-xl text-xs font-bold"
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Yes, remove"}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 h-9 rounded-xl text-xs font-bold"
                    >
                        Keep it
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Add Bank Modal ───────────────────────────────────────────────────────────

type ModalStep = "form" | "confirm" | "saving";

interface PaystackBank { id: number; name: string; code: string; }

interface AddBankModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function AddBankModal({ open, onClose, onSuccess }: AddBankModalProps) {
    const [step, setStep] = useState<ModalStep>("form");
    const [allBanks, setAllBanks] = useState<PaystackBank[]>([]);
    const [bankSearch, setBankSearch] = useState("");
    const [selectedBank, setSelectedBank] = useState<PaystackBank | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [accountNumber, setAccountNumber] = useState("");
    const [resolvedName, setResolvedName] = useState("");
    const [isResolving, setIsResolving] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch bank list when modal opens
    useEffect(() => {
        if (!open) return;
        if (allBanks.length > 0) return; // already loaded
        fetch("/api/public/banks")
            .then((r) => r.json())
            .then((d) => setAllBanks(d.data || []))
            .catch(() => toast.error("Could not load bank list"));
    }, [open]);

    function resetModal() {
        setStep("form");
        setSelectedBank(null);
        setBankSearch("");
        setAccountNumber("");
        setResolvedName("");
        setShowDropdown(false);
    }

    function handleClose() {
        resetModal();
        onClose();
    }

    const filteredBanks = allBanks.filter((b) =>
        b.name.toLowerCase().includes(bankSearch.toLowerCase())
    );

    async function handleResolve() {
        if (!selectedBank) { toast.error("Please select a bank"); return; }
        if (accountNumber.length !== 10) { toast.error("Account number must be 10 digits"); return; }

        setIsResolving(true);
        try {
            const res = await fetch(
                `/api/borrower/banks/resolve?account_number=${accountNumber}&bank_code=${selectedBank.code}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not resolve account");
            setResolvedName(data.data?.account_name || "");
            setStep("confirm");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsResolving(false);
        }
    }

    async function handleSave() {
        if (!selectedBank || !resolvedName) return;
        setIsSaving(true);
        setStep("saving");
        try {
            const res = await fetch("/api/borrower/banks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bankName: selectedBank.name,
                    bankCode: selectedBank.code,
                    accountNumber,
                    accountName: resolvedName,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save account");
            toast.success("Bank account added successfully!");
            resetModal();
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
            setStep("confirm");
        } finally {
            setIsSaving(false);
        }
    }

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 space-y-6 relative" onClick={(e) => e.stopPropagation()}>

                            {/* Header */}
                            <div className="text-center space-y-1">
                                <div className="size-14 bg-lemon-primary/20 text-main-green rounded-[20px] flex items-center justify-center mx-auto mb-4">
                                    <Landmark size={28} />
                                </div>
                                <h3 className="text-2xl font-black text-main-green">
                                    {step === "confirm" ? "Confirm Account" : step === "saving" ? "Saving…" : "Add Bank Account"}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {step === "form" && "Select your bank and enter your account number."}
                                    {step === "confirm" && "Please confirm this account belongs to you."}
                                    {step === "saving" && "Securely saving your bank account…"}
                                </p>
                            </div>

                            {/* ── STEP: form ─────────────────────────────── */}
                            {step === "form" && (
                                <div className="space-y-4">
                                    {/* Bank picker */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Bank</label>
                                        <div
                                            className="h-14 bg-[#f8fbf7] border border-gray-100 rounded-2xl px-5 flex items-center justify-between cursor-pointer select-none"
                                            onClick={() => setShowDropdown((v) => !v)}
                                        >
                                            {selectedBank ? (
                                                <span className="font-semibold text-gray-800">{selectedBank.name}</span>
                                            ) : (
                                                <span className="text-gray-400">Select a bank…</span>
                                            )}
                                            <ChevronDown size={18} className={cn("text-gray-400 transition-transform", showDropdown && "rotate-180")} />
                                        </div>

                                        {showDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-[20px] shadow-xl z-10 overflow-hidden">
                                                <div className="p-3 border-b border-gray-50">
                                                    <div className="relative">
                                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            autoFocus
                                                            placeholder="Search banks…"
                                                            value={bankSearch}
                                                            onChange={(e) => setBankSearch(e.target.value)}
                                                            className="pl-9 h-10 bg-gray-50 border-gray-100 rounded-xl text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-52 overflow-y-auto">
                                                    {allBanks.length === 0 ? (
                                                        <div className="flex items-center justify-center py-6">
                                                            <Loader2 className="animate-spin text-main-green" size={20} />
                                                        </div>
                                                    ) : filteredBanks.length === 0 ? (
                                                        <p className="text-center text-gray-400 text-sm py-4">No banks found</p>
                                                    ) : (
                                                        filteredBanks.map((bank) => (
                                                            <button
                                                                key={bank.id}
                                                                onClick={() => {
                                                                    setSelectedBank(bank);
                                                                    setBankSearch("");
                                                                    setShowDropdown(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left px-5 py-3 text-sm transition-colors",
                                                                    selectedBank?.id === bank.id
                                                                        ? "bg-lemon-primary/20 text-main-green font-bold"
                                                                        : "hover:bg-gray-50 text-gray-700"
                                                                )}
                                                            >
                                                                {bank.name}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Account Number</label>
                                        <Input
                                            placeholder="0123456789"
                                            maxLength={10}
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                                            className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6 font-mono text-lg tracking-widest"
                                        />
                                        <p className="text-xs text-gray-400 ml-1">{accountNumber.length}/10 digits</p>
                                    </div>

                                    <Button
                                        onClick={handleResolve}
                                        disabled={isResolving || !selectedBank || accountNumber.length !== 10}
                                        className="w-full h-14 bg-main-green text-white hover:bg-main-green/90 rounded-2xl text-base font-black shadow-lg shadow-main-green/20 disabled:opacity-50"
                                    >
                                        {isResolving ? (
                                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Resolving Account…</span>
                                        ) : "Resolve Account"}
                                    </Button>
                                    <Button variant="ghost" onClick={handleClose} className="w-full text-gray-400 font-bold">
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {/* ── STEP: confirm ──────────────────────────── */}
                            {step === "confirm" && (
                                <div className="space-y-5">
                                    <div className="bg-lemon-primary/10 rounded-[28px] p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-lemon-primary/30 rounded-xl flex items-center justify-center text-main-green shrink-0">
                                                <Landmark size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Bank</p>
                                                <p className="font-black text-gray-800">{selectedBank?.name}</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-lemon-primary/20" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Account Number</p>
                                            <p className="font-mono font-black text-gray-800 text-lg tracking-widest">{accountNumber}</p>
                                        </div>
                                        <div className="h-px bg-lemon-primary/20" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Account Name</p>
                                            <p className="font-black text-main-green text-lg">{resolvedName}</p>
                                        </div>
                                    </div>

                                    <p className="text-center text-sm text-gray-500 font-medium">
                                        Is this your account?
                                    </p>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSave}
                                            className="flex-1 h-14 bg-main-green text-white hover:bg-main-green/90 rounded-2xl font-black shadow-lg shadow-main-green/20"
                                        >
                                            <CheckCircle size={18} className="mr-2" /> Yes, this is mine
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => { setStep("form"); setResolvedName(""); }}
                                            className="h-14 px-5 rounded-2xl font-bold border-gray-200"
                                        >
                                            Go Back
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP: saving ───────────────────────────── */}
                            {step === "saving" && (
                                <div className="flex flex-col items-center justify-center py-8 gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="size-20 rounded-full border-4 border-dashed border-main-green/20 flex items-center justify-center"
                                    >
                                        <Loader2 className="text-main-green animate-spin" size={32} />
                                    </motion.div>
                                    <p className="text-gray-400 text-sm font-medium animate-pulse">Encrypting and saving your details…</p>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
