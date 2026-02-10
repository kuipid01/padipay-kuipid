import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, CreditCard, Lock, Search, ChevronRight, RefreshCw, Shield, Zap, Building2, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { NIGERIAN_BANKS } from "../constants";

interface BankStepProps {
    onConnect: (data: any) => void;
    onSkip: () => void;
    onBack: () => void;
    summary: any;
}

export function BankStep({ onConnect, onSkip, onBack, summary }: BankStepProps) {
    type BankSubStep = 'explanation' | 'selection' | 'linking' | 'mandate' | 'verifying' | 'success';
    const [subStep, setSubStep] = useState<BankSubStep>('explanation');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [isAgreed, setIsAgreed] = useState(false);

    const filteredBanks = NIGERIAN_BANKS.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (a.popular === b.popular ? 0 : a.popular ? -1 : 1));

    const handleBankSelect = (bank: any) => {
        setSelectedBank(bank);
        setSubStep('linking');
        // Simulate linking process
        setTimeout(() => {
            setSubStep('mandate');
        }, 3000);
    };

    const handleAuthorize = () => {
        setSubStep('verifying');
        // Simulate mandate verification
        setTimeout(() => {
            setSubStep('success');
            // Final callback after success screen
            setTimeout(() => {
                onConnect({
                    bankName: selectedBank.name,
                    accountNumber: "012****789", // Mock masked account
                });
            }, 2000);
        }, 3000);
    };

    const renderSubStep = () => {
        switch (subStep) {
            case 'explanation':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2">
                            <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 5 of 8</Badge>
                            <h2 className="text-3xl font-black">Link your bank account</h2>
                            <p className="text-gray-500">This helps us verify income and enable automatic repayment.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheck, title: "We never see your bank password", desc: "Security is our top priority." },
                                { icon: CreditCard, title: "We cannot move money without your approval", desc: "You are always in control." },
                                { icon: Lock, title: "Secured by bank-grade encryption", desc: "Your data is safe with us." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-[24px] bg-gray-50 border border-gray-100">
                                    <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-main-green shadow-sm">
                                        <item.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={() => setSubStep('selection')}
                                className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black shadow-lg shadow-main-green/20"
                            >
                                Continue
                            </Button>
                            <button
                                onClick={onSkip}
                                className="w-full text-center text-sm font-bold text-gray-400 hover:text-main-green transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </motion.div>
                );

            case 'selection':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">Select your bank</h2>
                            <p className="text-gray-500 text-sm">Choose the bank where you receive your income.</p>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={20} />
                            <Input
                                placeholder="Search banks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 pl-12 rounded-[20px] border-2 border-gray-100 focus:border-main-green/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredBanks.map((bank) => (
                                <button
                                    key={bank.slug}
                                    onClick={() => handleBankSelect(bank)}
                                    className="flex items-center gap-4 p-4 rounded-[20px] border-2 border-gray-50 hover:border-main-green/20 hover:bg-main-green/5 transition-all group text-left"
                                >
                                    <div
                                        className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                        style={{ backgroundColor: bank.color }}
                                    >
                                        {bank.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{bank.name}</p>
                                        {bank.popular && <p className="text-[10px] text-main-green font-bold uppercase tracking-wider">Popular</p>}
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-main-green transition-colors" size={18} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 'linking':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="size-32 rounded-full border-4 border-dashed border-main-green/20 flex items-center justify-center"
                            >
                                <div
                                    className="size-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl"
                                    style={{ backgroundColor: selectedBank?.color }}
                                >
                                    {selectedBank?.name.charAt(0)}
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                                <RefreshCw className="text-main-green animate-spin" size={20} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Connecting to {selectedBank?.name}</h3>
                            <div className="flex flex-col gap-1 items-center">
                                <p className="text-gray-400 text-sm animate-pulse">Fetching account details...</p>
                                <div className="flex gap-1 mt-2">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                            className="size-1.5 rounded-full bg-main-green"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-[280px] p-6 bg-gray-50 rounded-[24px] border border-gray-100 flex items-center gap-4">
                            <Shield className="text-main-green shrink-0" size={24} />
                            <p className="text-[10px] text-gray-400 text-left font-medium leading-relaxed">
                                We use secure end-to-end encryption. Your login details are never shared with us.
                            </p>
                        </div>
                    </div>
                );

            case 'mandate':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black">Confirm Auto-Debit</h2>
                            <p className="text-gray-500 text-sm">Authorize automatic repayment for your loan.</p>
                        </div>

                        <Card className="border-none bg-gray-50 rounded-[32px] overflow-hidden shadow-inner">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="size-12 rounded-xl flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: selectedBank?.color }}
                                    >
                                        {selectedBank?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{selectedBank?.name}</p>
                                        <p className="text-xs text-gray-400 font-mono tracking-wider">012****789</p>
                                    </div>
                                </div>
                                <Separator className="bg-gray-200/50" />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Debit Amount</span>
                                        <span className="font-black text-main-green">₦{summary?.totalPayable?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequency</span>
                                        <span className="font-black text-main-green">Once</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                                        <span className="font-black text-main-green">Due Date</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3 p-2">
                                <Checkbox
                                    id="mandate"
                                    checked={isAgreed}
                                    onCheckedChange={(c) => setIsAgreed(!!c)}
                                    className="mt-1 size-5 rounded-md border-2 border-main-green data-[state=checked]:bg-main-green"
                                />
                                <label htmlFor="mandate" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                                    I authorize <strong>PadiLoan</strong> to debit my account for loan repayment on the scheduled dates.
                                </label>
                            </div>

                            <Button
                                onClick={handleAuthorize}
                                disabled={!isAgreed}
                                className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black shadow-xl shadow-main-green/20"
                            >
                                Authorize Auto-Debit
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'verifying':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8">
                        <div className="relative">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="size-32 rounded-full bg-main-green/10 flex items-center justify-center"
                            >
                                <Building2 size={48} className="text-main-green" />
                            </motion.div>
                            <Loader2 className="absolute top-0 right-0 text-main-green animate-spin size-10" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black">Waiting for bank...</h3>
                            <p className="text-gray-400 text-sm max-w-[240px] mx-auto">
                                Your bank is confirming the authorization. You may receive an OTP.
                            </p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="size-32 rounded-full bg-lemon-primary flex items-center justify-center text-main-green">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <CheckCircle size={64} />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black">Linked Successfully!</h2>
                            <div className="p-6 bg-gray-50 rounded-[28px] border border-gray-100 w-full max-w-[320px] mx-auto space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold">Bank</span>
                                    <span className="font-black text-main-green">{selectedBank?.name}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold">Repayment</span>
                                    <span className="font-black text-main-green flex items-center gap-1">
                                        Automated <Zap size={10} className="fill-current" />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Continuing in a moment...</p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative">
            {subStep === 'explanation' || subStep === 'selection' ? (
                <button
                    onClick={onBack}
                    className="absolute -top-12 left-0 size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors z-10"
                >
                    <ArrowLeft size={18} />
                </button>
            ) : null}
            <div className="pt-4">
                {renderSubStep()}
            </div>
        </div>
    );
}
