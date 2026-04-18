"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, User, Briefcase, MapPin, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    EMPLOYMENT_TYPES,
    LGAS_BY_STATE,
    NIGERIAN_STATES,
    WAGE_RANGES,
} from "../constants";
import { FormData } from "../types";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

/* =========================
   🔐 ZOD SCHEMA
========================= */
export const KycValidationSchema = z.object({
    fullName: z.string().min(3, "Enter your full name"),
    address: z.string().min(5, "Enter a valid address"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "Select a state"),
    lga: z.string().min(1, "Select your LGA"),
    employmentType: z.string().min(1, "Select employment type"),
    wagesRange: z.string().min(1, "Select income range"),
    nextOfKinName: z.string().min(3, "Enter next of kin name"),
    nextOfKinPhone: z
        .string()
        .min(7, "Phone number is too short")
        .max(15, "Phone number is too long")
        .regex(/^[\d+\-\s()]+$/, "Enter a valid phone number"),
});

/* =========================
   🧠 NORMALIZER
========================= */
const normalizeKycData = (data: FormData) => ({
    ...data,
    city: data.city || data.lga,
    lga: data.lga || data.city,
    nextOfKinPhone: data.nextOfKinPhone.replace(/[\s\-()]/g, ""),
});

/* =========================
   SECTION HEADER
========================= */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 pt-2 pb-1">
            <div className="size-8 rounded-xl bg-main-green/10 flex items-center justify-center text-main-green">
                {icon}
            </div>
            <h3 className="text-sm font-black text-main-green uppercase tracking-widest">{title}</h3>
        </div>
    );
}

/* =========================
   COMPONENT
========================= */
interface KycStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function KycStep({
    formData,
    update,
    onNext,
    onBack,
}: KycStepProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { slug } = useParams();

    const lgas = LGAS_BY_STATE[formData.state] || [];

    /* =========================
       ⚡ LIVE VALIDATION
    ========================= */
    const validateField = (field: keyof FormData, value: any) => {
        //@ts-expect-error
        const fieldSchema = KycValidationSchema.shape[field];
        if (!fieldSchema) return;

        const result = fieldSchema.safeParse(value);
        setErrors((prev) => ({
            ...prev,
            [field]: result.success ? "" : result.error.issues[0].message,
        }));
    };

    /* =========================
       ✅ FORM VALID STATE
    ========================= */
    const isFormValid = useMemo(() => {
        return KycValidationSchema.safeParse(
            normalizeKycData(formData)
        ).success;
    }, [formData]);

    /* =========================
       👉 CONTINUE
    ========================= */
    const handleContinue = () => {
        const dataToValidate = normalizeKycData(formData);
        const result = KycValidationSchema.safeParse(dataToValidate);

        if (!result.success) {
            const formatted = result.error.flatten().fieldErrors;
            const newErrors: Record<string, string> = {};
            Object.keys(formatted).forEach((key) => {
                //@ts-expect-error
                if (formatted[key]?.[0]) {
                    //@ts-expect-error
                    newErrors[key] = formatted[key][0];
                }
            });
            setErrors(newErrors);
            toast.error(Object.values(newErrors)[0]);
            return;
        }

        setErrors({});
        onNext();
    };

    /* =========================
       🎨 INPUT STYLE HELPER
    ========================= */
    const inputStyle = (field: keyof FormData) =>
        cn(
            "h-14 px-5 rounded-2xl border-2 font-medium text-sm transition-all duration-200 placeholder:text-gray-400",
            errors[field]
                ? "border-red-400 bg-red-50/50 focus:ring-red-100"
                : formData[field]
                    ? "border-main-green/40 bg-main-green/[0.02]"
                    : "border-gray-100 focus:border-main-green focus:ring-4 focus:ring-main-green/10"
        );

    const fieldError = (field: string) =>
        errors[field] ? (
            <p className="text-[11px] text-red-500 font-medium pl-2 animate-in slide-in-from-top-1 fade-in duration-200">
                {errors[field]}
            </p>
        ) : null;

    return (
        <div className="space-y-8">
            {/* BACK */}
            <button
                onClick={onBack}
                className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
                <ArrowLeft size={18} />
            </button>

            {/* HEADER */}
            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">
                    Step 7 of 8
                </Badge>
                <h2 className="text-3xl font-black">Final Details</h2>
                <p className="text-gray-500 text-sm">
                    Just a few more things to complete your profile. All fields are required.
                </p>
            </div>

            {/* FORM */}
            <div className="space-y-8">

                {/* ── Personal ── */}
                <div className="space-y-4">
                    <SectionHeader icon={<User size={14} />} title="Personal" />
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Full Name</label>
                        <Input
                            placeholder="e.g. Adebayo Oluwaseun"
                            value={formData.fullName}
                            onChange={(e) => {
                                update({ fullName: e.target.value });
                                validateField("fullName", e.target.value);
                            }}
                            className={inputStyle("fullName")}
                        />
                        {fieldError("fullName")}
                    </div>
                </div>

                {/* ── Employment ── */}
                <div className="space-y-4">
                    <SectionHeader icon={<Briefcase size={14} />} title="Employment" />

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Employment Type</label>
                        <Select
                            value={formData.employmentType}
                            onValueChange={(val) => {
                                update({ employmentType: val });
                                validateField("employmentType", val);
                            }}
                        >
                            <SelectTrigger className={inputStyle("employmentType")}>
                                <SelectValue placeholder="Select your employment type" />
                            </SelectTrigger>
                            <SelectContent>
                                {EMPLOYMENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Monthly Income Range</label>
                        <Select
                            value={formData.wagesRange}
                            onValueChange={(val) => {
                                update({ wagesRange: val });
                                validateField("wagesRange", val);
                            }}
                        >
                            <SelectTrigger className={inputStyle("wagesRange")}>
                                <SelectValue placeholder="Select income range" />
                            </SelectTrigger>
                            <SelectContent>
                                {WAGE_RANGES.map((range) => (
                                    <SelectItem key={range} value={range}>
                                        {range}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Location ── */}
                <div className="space-y-4">
                    <SectionHeader icon={<MapPin size={14} />} title="Location" />

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Home Address</label>
                        <Input
                            placeholder="e.g. 12 Allen Avenue, Ikeja"
                            value={formData.address}
                            onChange={(e) => {
                                update({ address: e.target.value });
                                validateField("address", e.target.value);
                            }}
                            className={inputStyle("address")}
                        />
                        {fieldError("address")}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 pl-2">State</label>
                            <Select
                                value={formData.state}
                                onValueChange={(val) => {
                                    update({ state: val, lga: "" });
                                    validateField("state", val);
                                }}
                            >
                                <SelectTrigger className={inputStyle("state")}>
                                    <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NIGERIAN_STATES.map((state) => (
                                        <SelectItem key={state} value={state}>
                                            {state}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 pl-2">LGA / City</label>
                            {lgas.length > 0 ? (
                                <Select
                                    value={formData.lga}
                                    onValueChange={(val) => {
                                        update({ lga: val, city: val });
                                        validateField("lga", val);
                                    }}
                                >
                                    <SelectTrigger className={inputStyle("lga")}>
                                        <SelectValue placeholder="LGA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lgas.map((lga) => (
                                            <SelectItem key={lga} value={lga}>
                                                {lga}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    placeholder="City / LGA"
                                    value={formData.lga || formData.city}
                                    onChange={(e) => {
                                        update({ lga: e.target.value, city: e.target.value });
                                        validateField("lga", e.target.value);
                                    }}
                                    className={inputStyle("lga")}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Next of Kin ── */}
                <div className="space-y-4">
                    <SectionHeader icon={<UserCheck size={14} />} title="Next of Kin" />

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Full Name</label>
                        <Input
                            placeholder="e.g. Folake Adeyemi"
                            value={formData.nextOfKinName}
                            onChange={(e) => {
                                update({ nextOfKinName: e.target.value });
                                validateField("nextOfKinName", e.target.value);
                            }}
                            className={inputStyle("nextOfKinName")}
                        />
                        {fieldError("nextOfKinName")}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 pl-2">Phone Number</label>
                        <Input
                            placeholder="e.g. 08012345678 or +1 555-1234"
                            type="tel"
                            inputMode="tel"
                            value={formData.nextOfKinPhone}
                            onChange={(e) => {
                                update({ nextOfKinPhone: e.target.value });
                                validateField("nextOfKinPhone", e.target.value);
                            }}
                            className={inputStyle("nextOfKinPhone")}
                        />
                        {fieldError("nextOfKinPhone")}
                    </div>
                </div>

                {/* CONTINUE */}
                <Button
                    onClick={handleContinue}
                    disabled={!isFormValid}
                    className={cn(
                        "w-full h-16 rounded-[24px] text-lg font-black transition-all duration-300",
                        isFormValid
                            ? "bg-main-green text-white shadow-xl shadow-main-green/20 hover:shadow-2xl hover:shadow-main-green/30"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Continue <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}