import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EMPLOYMENT_TYPES, LGAS_BY_STATE, NIGERIAN_STATES, WAGE_RANGES } from "../constants";
import { FormData } from "../types";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

export const KycValidationSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    lga: z.string().min(1, "LGA is required"),
    employmentType: z.string().min(1, "Employment type is required"),
    wagesRange: z.string().min(1, "Wages range is required"),
    nextOfKinName: z.string().min(1, "Next of kin name is required"),
    nextOfKinPhone: z
        .string()
        .min(10, "Phone number is too short")
        .max(15, "Phone number is too long"),
    phone: z
        .string()
        .min(10, "Phone number is too short")
        .max(15, "Phone number is too long"),
});

interface KycStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function KycStep({ formData, update, onNext, onBack }: KycStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { slug } = useParams();
    const lgas = LGAS_BY_STATE[formData.state] || [];

    const handleContinue = () => {
        // Retrieve persisted data if current state is lost
        const savedEmail = localStorage.getItem(`padi_loan_email_${slug}`);
        const savedPhone = localStorage.getItem(`padi_loan_phone_${slug}`);

        // Prepare data for validation, ensuring lga and city are synced if one is used as fallback
        const dataToValidate = {
            ...formData,
            email: savedEmail || formData.email,
            phone: savedPhone || formData.phone,
            city: formData.city || formData.lga,
            lga: formData.lga || formData.city
        };

        const result = KycValidationSchema.safeParse(dataToValidate);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(newErrors);
            const firstError = result.error.issues[0];
            toast.error(firstError.message);
            return;
        }

        setErrors({});
        onNext();
    };

    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 7 of 8</Badge>
                <h2 className="text-3xl font-black">Final Details</h2>
                <p className="text-gray-500">Just a few more things to complete your profile.</p>
            </div>

            <div className="space-y-6">
                {!formData.fullName && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                        <Input
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => {
                                update({ fullName: e.target.value });
                                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                            }}
                            className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.fullName ? "border-red-500" : "border-gray-100")}
                        />
                        {errors.fullName && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.fullName}</p>}
                    </div>
                )}

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Employment & Income</label>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Select value={formData.employmentType} onValueChange={(val) => {
                                update({ employmentType: val });
                                if (errors.employmentType) setErrors(prev => ({ ...prev, employmentType: "" }));
                            }}>
                                <SelectTrigger className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.employmentType ? "border-red-500" : "border-gray-100")}>
                                    <SelectValue placeholder="Employment Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[20px] border-gray-100">
                                    {EMPLOYMENT_TYPES.map(type => (
                                        <SelectItem key={type} value={type} className="rounded-xl">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employmentType && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.employmentType}</p>}
                        </div>

                        <div className="space-y-2">
                            <Select value={formData.wagesRange} onValueChange={(val) => {
                                update({ wagesRange: val });
                                if (errors.wagesRange) setErrors(prev => ({ ...prev, wagesRange: "" }));
                            }}>
                                <SelectTrigger className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.wagesRange ? "border-red-500" : "border-gray-100")}>
                                    <SelectValue placeholder="Monthly Income Range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[20px] border-gray-100">
                                    {WAGE_RANGES.map(range => (
                                        <SelectItem key={range} value={range} className="rounded-xl">{range}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.wagesRange && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.wagesRange}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Separator className="bg-gray-50" />
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Residential Address</label>
                    <Input
                        placeholder="123 Street Name, Area"
                        value={formData.address}
                        onChange={(e) => {
                            update({ address: e.target.value });
                            if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                        }}
                        className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.address ? "border-red-500" : "border-gray-100")}
                    />
                    {errors.address && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.address}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Select value={formData.state} onValueChange={(val) => {
                                update({ state: val, lga: "" });
                                if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                            }}>
                                <SelectTrigger className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.state ? "border-red-500" : "border-gray-100")}>
                                    <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[20px] border-gray-100">
                                    {NIGERIAN_STATES.map(state => (
                                        <SelectItem key={state} value={state} className="rounded-xl">{state}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.state && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.state}</p>}
                        </div>

                        <div className="space-y-2">
                            {lgas.length > 0 ? (
                                <Select value={formData.lga} onValueChange={(val) => {
                                    update({ lga: val, city: val });
                                    if (errors.lga) setErrors(prev => ({ ...prev, lga: "", city: "" }));
                                }}>
                                    <SelectTrigger className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.lga || errors.city ? "border-red-500" : "border-gray-100")}>
                                        <SelectValue placeholder="LGA" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[20px] border-gray-100">
                                        {lgas.map(lga => (
                                            <SelectItem key={lga} value={lga} className="rounded-xl">{lga}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    placeholder="LGA / City"
                                    value={formData.lga || formData.city}
                                    onChange={(e) => {
                                        update({ lga: e.target.value, city: e.target.value });
                                        if (errors.lga || errors.city) setErrors(prev => ({ ...prev, lga: "", city: "" }));
                                    }}
                                    className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.lga || errors.city ? "border-red-500" : "border-gray-100")}
                                />
                            )}
                            {(errors.lga || errors.city) && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.lga || errors.city}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Separator className="bg-gray-50" />
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Next of Kin</label>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Input
                                placeholder="Full Name"
                                value={formData.nextOfKinName}
                                onChange={(e) => {
                                    update({ nextOfKinName: e.target.value });
                                    if (errors.nextOfKinName) setErrors(prev => ({ ...prev, nextOfKinName: "" }));
                                }}
                                className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.nextOfKinName ? "border-red-500" : "border-gray-100")}
                            />
                            {errors.nextOfKinName && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.nextOfKinName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Input
                                placeholder="Phone Number"
                                value={formData.nextOfKinPhone}
                                onChange={(e) => {
                                    update({ nextOfKinPhone: e.target.value });
                                    if (errors.nextOfKinPhone) setErrors(prev => ({ ...prev, nextOfKinPhone: "" }));
                                }}
                                className={cn("h-16 px-6 rounded-[24px] border-2 font-bold", errors.nextOfKinPhone ? "border-red-500" : "border-gray-100")}
                            />
                            {errors.nextOfKinPhone && <p className="text-[10px] font-bold text-red-500 ml-4">{errors.nextOfKinPhone}</p>}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleContinue}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black mt-4"
                >
                    Continue <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
