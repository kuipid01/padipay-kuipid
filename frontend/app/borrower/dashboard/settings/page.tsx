"use client";

import { useState } from "react";
import { Settings, Lock, Landmark, Loader2, Plus, Trash2 } from "lucide-react";
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

function SecurityTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/borrower/settings/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");

            toast.success("Password updated successfully");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div>
                <h3 className="text-xl font-black text-main-green mb-2">Change Password</h3>
                <p className="text-gray-500 text-sm">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Current Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6"
                        required
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6"
                        required
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                </div>
                <Button disabled={isLoading} className="w-full h-14 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl text-lg font-black mt-4 shadow-lg shadow-lemon-primary/20">
                    {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                </Button>
            </form>
        </div>
    );
}

function BankingTab() {
    const [isAdding, setIsAdding] = useState(false);
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-main-green mb-2">Payout Accounts</h3>
                        <p className="text-gray-500 text-sm">Manage where you receive your loan disbursements.</p>
                    </div>
                    <Button onClick={() => setIsAdding(true)} className="bg-main-green text-white hover:bg-main-green/90 rounded-2xl px-6 h-12 font-bold shadow-lg shadow-main-green/20">
                        <Plus className="mr-2 h-4 w-4" /> Add New Bank
                    </Button>
                </div>

                <div className="space-y-4">
                    {banks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 italic">
                            <Landmark size={48} className="mb-4 opacity-20" />
                            <p>No payout accounts added yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bank List Item Component */}
                        </div>
                    )}
                </div>
            </div>

            {isAdding && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[40px] border-2 border-lemon-primary shadow-xl">
                    <h3 className="text-xl font-black text-main-green mb-6 text-center">Add New Payout Account</h3>
                    <div className="space-y-4 max-w-md mx-auto">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Bank Name</label>
                            <Input placeholder="Select Bank" className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Account Number</label>
                            <Input placeholder="0123456789" className="h-14 bg-[#f8fbf7] border-gray-100 rounded-2xl px-6" />
                        </div>
                        <Button className="w-full h-14 bg-main-green text-white hover:bg-main-green/90 rounded-2xl text-lg font-black mt-2 shadow-lg shadow-main-green/20">
                            Verify & Save
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="w-full text-gray-500 font-bold">
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
