"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
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
        .regex(/^0\d{10}$/, "Enter valid Nigerian phone (080...)"),
    phone: z
        .string()
        .regex(/^0\d{10}$/, "Enter valid Nigerian phone"),
});

/* =========================
   🧠 NORMALIZER
========================= */
const normalizeKycData = (data: FormData) => ({
    ...data,
    city: data.city || data.lga,
    lga: data.lga || data.city,
});

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
            "h-16 px-6 rounded-[24px] border-2 font-bold transition-all",
            errors[field]
                ? "border-red-500 focus:ring-red-200"
                : formData[field]
                    ? "border-green-500"
                    : "border-gray-100 focus:border-main-green"
        );

    return (
        <div className="space-y-8">
            {/* BACK */}
            <button
                onClick={onBack}
                className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50"
            >
                <ArrowLeft size={18} />
            </button>

            {/* HEADER */}
            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">
                    Step 7 of 8
                </Badge>
                <h2 className="text-3xl font-black">Final Details</h2>
                <p className="text-gray-500">
                    Just a few more things to complete your profile.
                </p>
            </div>

            {/* FORM */}
            <div className="space-y-6">
                {/* FULL NAME */}
                <div className="space-y-2">
                    <Input
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => {
                            update({ fullName: e.target.value });
                            validateField("fullName", e.target.value);
                        }}
                        className={inputStyle("fullName")}
                    />
                    {errors.fullName && (
                        <p className="text-xs text-red-500">{errors.fullName}</p>
                    )}
                </div>

                {/* EMPLOYMENT */}
                <Select
                    value={formData.employmentType}
                    onValueChange={(val) => {
                        update({ employmentType: val });
                        validateField("employmentType", val);
                    }}
                >
                    <SelectTrigger className={inputStyle("employmentType")}>
                        <SelectValue placeholder="Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* INCOME */}
                <Select
                    value={formData.wagesRange}
                    onValueChange={(val) => {
                        update({ wagesRange: val });
                        validateField("wagesRange", val);
                    }}
                >
                    <SelectTrigger className={inputStyle("wagesRange")}>
                        <SelectValue placeholder="Income Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {WAGE_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                                {range}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* ADDRESS */}
                <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => {
                        update({ address: e.target.value });
                        validateField("address", e.target.value);
                    }}
                    className={inputStyle("address")}
                />

                {/* STATE */}
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

                {/* LGA */}
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

                {/* NEXT OF KIN */}
                <Input
                    placeholder="Next of Kin Name"
                    value={formData.nextOfKinName}
                    onChange={(e) => {
                        update({ nextOfKinName: e.target.value });
                        validateField("nextOfKinName", e.target.value);
                    }}
                    className={inputStyle("nextOfKinName")}
                />

                <Input
                    placeholder="Next of Kin Phone"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => {
                        update({ nextOfKinPhone: e.target.value });
                        validateField("nextOfKinPhone", e.target.value);
                    }}
                    className={inputStyle("nextOfKinPhone")}
                />

                {/* CONTINUE */}
                <Button
                    onClick={handleContinue}
                    disabled={!isFormValid}
                    className={cn(
                        "w-full h-16 rounded-[24px] text-lg font-black mt-4",
                        isFormValid
                            ? "bg-main-green text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Continue <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}