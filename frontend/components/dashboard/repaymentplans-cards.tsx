import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    
    Loader2,
    Save
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

interface LoanApp {
    id: string;
    name: string;
    slug: string;
    isActive: boolean | null;
    createdAt: string;
    repaymentPlans: RepaymentPlan[];
}

type RepaymentPlan = {
    id: string;
    name: string;
    durationDays: number;
    interestRate: number;
    creditTier: "excellent" | "good" | "fair" | "poor" | "all";
    earlyRepaymentAllowed: boolean;
    earlyRepaymentDiscount?: number | null;
    gracePeriodDays: number;
    lateFeesPercentage: number;
    isDefault: boolean;
    isActive: boolean;
    loanAppId?: string;
};
interface AppSettingsFormProps {
    app: LoanApp;
}
export const RepaymentplansCards = ({ app }: AppSettingsFormProps) => {
    const router = useRouter();
  const [isSavingPlans, setIsSavingPlans] = useState(false);

     const [repaymentPlans, setRepaymentPlans] = useState<RepaymentPlan[]>(
            () => app.repaymentPlans ?? []
        );
    



  const updatePlan = (index: number, updates: Partial<RepaymentPlan>) => {
    setRepaymentPlans((prev) =>
      prev.map((plan, i) => (i === index ? { ...plan, ...updates } : plan)),
    );
  };

  const setDefaultPlan = (index: number) => {
    setRepaymentPlans((prev) =>
      prev.map((plan, i) => ({ ...plan, isDefault: i === index })),
    );
  };

  const saveRepaymentPlans = async () => {
    if (repaymentPlans.length === 0) {
      toast.error("At least one repayment plan is required.");
      return;
    }
    setIsSavingPlans(true);
    try {
      const defaultIndex = repaymentPlans.findIndex((plan) => plan.isDefault);
      const normalizedPlans =
        defaultIndex === -1
          ? repaymentPlans.map((plan, i) => ({ ...plan, isDefault: i === 0 }))
          : repaymentPlans;

      const responses = await Promise.all(
        normalizedPlans.map((plan) =>
          fetch(`/api/repayment-plans/${plan.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: plan.name,
              durationDays: plan.durationDays,
              interestRate: plan.interestRate,
              creditTier: plan.creditTier,
              earlyRepaymentAllowed: plan.earlyRepaymentAllowed,
              earlyRepaymentDiscount: plan.earlyRepaymentAllowed
                ? (plan.earlyRepaymentDiscount ?? 0)
                : 0,
              gracePeriodDays: plan.gracePeriodDays,
              lateFeesPercentage: plan.lateFeesPercentage,
              isDefault: plan.isDefault,
              isActive: plan.isActive,
            }),
          }),
        ),
      );

      for (const res of responses) {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update repayment plans");
        }
      }

      toast.success("Repayment plans updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPlans(false);
    }
  };
  return (
    <Card className="border-none shadow-sm rounded-[32px]">
      <CardHeader className="p-8 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-main-green">
              Repayment Plans
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage repayment options attached to this loan app.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-2xl font-bold gap-2 border-gray-100 shadow-sm"
            onClick={saveRepaymentPlans}
            disabled={isSavingPlans}
          >
            {isSavingPlans ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Plans
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {repaymentPlans.length === 0 ? (
          <div className="p-6 text-center text-sm font-bold text-gray-400">
            No repayment plans available.
          </div>
        ) : (
          repaymentPlans.map((plan, index) => (
            <Card
              key={plan.id}
              className="border border-gray-100 rounded-2xl shadow-sm"
            >
              <CardHeader className="p-6 pb-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Input
                      value={plan.name}
                      onChange={(e) =>
                        updatePlan(index, { name: e.target.value })
                      }
                      className="h-10 rounded-xl border-gray-100 font-black text-main-green"
                      placeholder="Plan name"
                    />
                    <p className="text-xs text-gray-400 font-bold mt-2">
                      ID: {plan.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.isDefault && (
                      <Badge className="bg-lemon-primary/40 text-main-green border-none text-[10px] font-black uppercase tracking-widest">
                        Default
                      </Badge>
                    )}
                    {!plan.isDefault && (
                      <Button
                        variant="ghost"
                        className="text-xs font-bold"
                        onClick={() => setDefaultPlan(index)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Badge
                      className={cn(
                        "font-black text-[10px] border-none uppercase tracking-widest h-7 px-3",
                        plan.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Credit Tier
                    </label>
                    <Select
                      value={plan.creditTier}
                      onValueChange={(value) =>
                        updatePlan(index, {
                          creditTier: value as RepaymentPlan["creditTier"],
                        })
                      }
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-gray-100 shadow-sm">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Duration (Days)
                    </label>
                    <Input
                      type="number"
                      value={plan.durationDays}
                      onChange={(e) =>
                        updatePlan(index, {
                          durationDays: Number(e.target.value),
                        })
                      }
                      className="h-11 rounded-2xl border-gray-100 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={plan.interestRate}
                      onChange={(e) =>
                        updatePlan(index, {
                          interestRate: Number(e.target.value),
                        })
                      }
                      className="h-11 rounded-2xl border-gray-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Late Fees (%)
                    </label>
                    <Input
                      type="number"
                      value={plan.lateFeesPercentage}
                      onChange={(e) =>
                        updatePlan(index, {
                          lateFeesPercentage: Number(e.target.value),
                        })
                      }
                      className="h-11 rounded-2xl border-gray-100 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Grace Period (Days)
                    </label>
                    <Input
                      type="number"
                      value={plan.gracePeriodDays}
                      onChange={(e) =>
                        updatePlan(index, {
                          gracePeriodDays: Number(e.target.value),
                        })
                      }
                      className="h-11 rounded-2xl border-gray-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Early Repayment Discount (%)
                    </label>
                    <Input
                      type="number"
                      value={plan.earlyRepaymentDiscount ?? 0}
                      onChange={(e) =>
                        updatePlan(index, {
                          earlyRepaymentDiscount: Number(e.target.value),
                        })
                      }
                      className="h-11 rounded-2xl border-gray-100 shadow-sm"
                      disabled={!plan.earlyRepaymentAllowed}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={plan.earlyRepaymentAllowed}
                      onCheckedChange={(checked) =>
                        updatePlan(index, { earlyRepaymentAllowed: checked })
                      }
                    />
                    <span className="text-sm font-bold text-gray-600">
                      Allow Early Repayment
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={(checked) =>
                        updatePlan(index, { isActive: checked })
                      }
                    />
                    <span className="text-sm font-bold text-gray-600">
                      Plan Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
