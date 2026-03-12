import { useState } from "react";
import { ArrowLeft, Lock, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormData } from "../types";
import { toast } from "sonner";

interface PasscodeStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PasscodeStep({ formData, update, onNext, onBack }: PasscodeStepProps) {
    const [confirmPasscode, setConfirmPasscode] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false)
    const handleContinue = async () => {
        if (formData.passcode.length < 6) {
            setError("Passcode must be 6 digits");
            return;
        }
        if (formData.passcode !== confirmPasscode) {
            setError("Passcodes do not match");
            return;
        }
        setPending(true)

        const res = await fetch("/api/auth/passcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                passcode: formData.passcode, email: formData.email, phone: formData.phone
            }),
        });
        setPending(false)
        if (res.ok) {
            setPending(false)
            onNext();
        }
        else {
            setPending(false)
            toast.error("Failed to set passcode , please try again later ")
        }
    };


    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 3 of 8</Badge>
                <h2 className="text-3xl font-black">Set Secure Passcode</h2>
                <p className="text-gray-500">Create a 6-digit passcode to secure your loan applications.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                            <Lock size={20} />
                        </div>
                        <Input
                            placeholder="Enter 6-digit passcode"
                            type="password"
                            inputMode="numeric"
                            value={formData.passcode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                update({ passcode: val });
                                if (error) setError("");
                            }}
                            className="h-16 pl-14 pr-6 rounded-[24px] border-2 border-gray-100 focus:border-main-green/20 focus:ring-4 focus:ring-main-green/5 text-xl font-bold transition-all text-center tracking-[0.5em]"
                            maxLength={6}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors">
                            <Lock size={20} />
                        </div>
                        <Input
                            placeholder="Confirm passcode"
                            type="password"
                            inputMode="numeric"
                            value={confirmPasscode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setConfirmPasscode(val);
                                if (error) setError("");
                            }}
                            className="h-16 pl-14 pr-6 rounded-[24px] border-2 border-gray-100 focus:border-main-green/20 focus:ring-4 focus:ring-main-green/5 text-xl font-bold transition-all text-center tracking-[0.5em]"
                            maxLength={6}
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                <Button
                    onClick={handleContinue}
                    disabled={formData.passcode.length < 6 || confirmPasscode.length < 6 || pending}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                >
                    {pending ? "Setting Passcode..." : "Set Passcode"} <ArrowRight className="ml-2" />
                </Button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                <Shield size={16} className="text-gray-400 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed text-center w-full">
                    Your passcode will be required to authorize future withdrawals and profile updates.
                </p>
            </div>
        </div>
    );
}
