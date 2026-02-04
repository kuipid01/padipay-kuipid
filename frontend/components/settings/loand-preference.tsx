'use client';

import { useEffect, useState, useCallback } from "react";
import { FileText, ShieldCheck, ClipboardCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "./section-header";
import { toast } from "sonner";

export const LoanPreferenceSection = () => {
  const [preferences, setPreferences] = useState<LoanPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  /* ================= Fetch on mount ================= */
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch("/api/loan-preferences");
        if (!res.ok) return;

        const data = await res.json();
        setPreferences((prev) => ({ ...prev, ...data }));

      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  /* ================= Partial updater ================= */
  const updatePreference = useCallback(
    async (patch: Partial<LoanPreferences>) => {
      // optimistic update
      setPreferences((prev) => ({ ...prev, ...patch }));

      await fetch("/api/loan-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
        toast.success("Preference updated")
    },
    []
  );

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading preferences…</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<FileText size={24} />}
        title="Loan Preferences"
        description="Configure default loan rules, documents, and verification requirements."
      />

      {/* ================= Loan Rules ================= */}
      <Card className="border-none shadow-sm rounded-[32px]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-lg font-black text-main-green">
            Loan Rules
          </CardTitle>
          <CardDescription className="text-gray-500">
            Set default parameters for new loan applications.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Minimum Loan Amount"
            value={preferences.minLoanAmount}
            onBlur={(v) => updatePreference({ minLoanAmount: v })}
          />
          <InputField
            label="Maximum Loan Amount"
            value={preferences.maxLoanAmount}
            onBlur={(v) => updatePreference({ maxLoanAmount: v })}
          />
          <InputField
            label="Default Interest Rate (%)"
            value={preferences.defaultInterestRate}
            onBlur={(v) => updatePreference({ defaultInterestRate: v })}
          />
          <InputField
            label="Grace Period (Days)"
            value={preferences.gracePeriodDays}
            onBlur={(v) => updatePreference({ gracePeriodDays: v })}
          />
        </CardContent>
      </Card>

      {/* ================= Documents ================= */}
      <ToggleCard
        title="Documents Required"
        icon={<ClipboardCheck size={18} />}
        items={[
          ["Government ID", "requireGovernmentId"],
          ["Proof of Address", "requireProofOfAddress"],
          ["Bank Statement (3 months)", "requireBankStatement"],
          ["Utility Bill", "requireUtilityBill"],
          ["Employment Letter", "requireEmploymentLetter"],
        ]}
        preferences={preferences}
        onToggle={updatePreference}
      />

      {/* ================= Verifications ================= */}
      <ToggleCard
        title="Verification Requirements"
        icon={<ShieldCheck size={18} />}
        items={[
          ["BVN Verification", "requireBVNVerification"],
          ["Phone Number Verification", "requirePhoneVerification"],
          ["Bank Account Validation", "requireBankAccountValidation"],
          ["Credit Bureau Check", "requireCreditBureauCheck"],
        ]}
        preferences={preferences}
        onToggle={updatePreference}
      />

      {/* ================= Auto Approve ================= */}
      <Card className="border-none shadow-sm rounded-[32px] bg-gray-50/50">
        <CardHeader className="p-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-main-green">
              Auto-Approve Engine
            </CardTitle>
            <CardDescription className="text-gray-500 max-w-md">
              Automatically approve applications that meet all requirements.
            </CardDescription>
          </div>
          <Switch
            checked={preferences.autoApproveEnabled}
            onCheckedChange={(v) => updatePreference({ autoApproveEnabled: v })}
            className="data-[state=checked]:bg-main-green"
          />
        </CardHeader>
      </Card>
    </div>
  );
};






const InputField = ({
  label,
  value,
  onBlur,
}: {
  label: string;
  value: number;
  onBlur: (value: number) => void;
}) => (
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
      {label}
    </label>
    <Input
      type="number"
      defaultValue={value}
      onBlur={(e) => onBlur(Number(e.target.value))}
      className="h-12 rounded-2xl border-gray-100 shadow-sm"
    />
  </div>
);

const ToggleCard = ({
  title,
  icon,
  items,
  preferences,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  items: [string, keyof LoanPreferences][];
  preferences: LoanPreferences;
  onToggle: (patch: Partial<LoanPreferences>) => void;
}) => (
  <Card className="border-none shadow-sm rounded-[32px]">
    <CardHeader className="p-8 pb-0">
      <CardTitle className="text-lg font-black text-main-green flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-8 space-y-3">
      {items.map(([label, key]) => (
        <div
          key={key}
          className="flex items-center justify-between rounded-2xl border px-5 py-4"
        >
          <span className="font-semibold text-gray-700">{label}</span>
         { typeof preferences[key]==="boolean" &&   <Switch
            checked={preferences[key] as boolean}
            onCheckedChange={(v) => onToggle({ [key]: v })}
            className="data-[state=checked]:bg-main-green"
          />}
        </div>
      ))}
    </CardContent>
  </Card>
);


type LoanPreferences = {
  minLoanAmount: number;
  maxLoanAmount: number;
  defaultInterestRate: number;
  gracePeriodDays: number;

  requireGovernmentId: boolean;
  requireProofOfAddress: boolean;
  requireBankStatement: boolean;
  requireUtilityBill: boolean;
  requireEmploymentLetter: boolean;

  requireBVNVerification: boolean;
  requirePhoneVerification: boolean;
  requireBankAccountValidation: boolean;
  requireCreditBureauCheck: boolean;

  autoApproveEnabled: boolean;
};



const DEFAULT_PREFERENCES: LoanPreferences = {
  minLoanAmount: 10_000,
  maxLoanAmount: 5_000_000,
  defaultInterestRate: 5,
  gracePeriodDays: 3,

  requireGovernmentId: true,
  requireProofOfAddress: true,
  requireBankStatement: false,
  requireUtilityBill: false,
  requireEmploymentLetter: false,

  requireBVNVerification: true,
  requirePhoneVerification: true,
  requireBankAccountValidation: true,
  requireCreditBureauCheck: false,

  autoApproveEnabled: false,
};
