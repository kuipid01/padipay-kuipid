"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Trash2,
  Percent,
  Clock,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AppFormValues, RepaymentPlan, CREDIT_TIERS } from "../_lib/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StepPlansProps {
  form: UseFormReturn<AppFormValues>;
}

const DURATION_PRESETS = [
  { days: 30, label: "30 Days" },
  { days: 60, label: "60 Days" },
  { days: 90, label: "3 Months" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
];

export function StepPlans({ form }: StepPlansProps) {
  const watchPlans = form.watch("repaymentPlans");

  const addRepaymentPlan = () => {
    const currentPlans = form.getValues("repaymentPlans");

    const newPlan: RepaymentPlan = {
      id: `plan-${Date.now()}`,
      name: `Standard Plan ${currentPlans.length + 1}`,
      durationDays: 30,
      interestRate: 10,
      creditTier: "all",
      earlyRepaymentAllowed: true,
      lateFeesPercentage: 5,
      isDefault: false,
    };

    form.setValue("repaymentPlans", [...currentPlans, newPlan]);
    toast.success("New plan added");
  };

  const removeRepaymentPlan = (index: number) => {
    const currentPlans = form.getValues("repaymentPlans");

    if (currentPlans.length === 1) {
      toast.error("You must have at least one repayment plan");
      return;
    }

    form.setValue(
      "repaymentPlans",
      currentPlans.filter((_, i) => i !== index)
    );
  };

  const setDefaultPlan = (index: number) => {
    const currentPlans = form.getValues("repaymentPlans");

    const updatedPlans = currentPlans.map((plan, i) => ({
      ...plan,
      isDefault: i === index,
    }));

    form.setValue("repaymentPlans", updatedPlans);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-[#06251f] via-[#0b3a31] to-[#08231f] px-8 py-8 shadow-2xl shadow-emerald-950/10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-white shadow-none backdrop-blur">
              Step 3
            </Badge>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Repayment Plans
              </h2>
              <p className="text-base leading-7 text-emerald-50/75">
                Create flexible repayment options, assign borrower tiers, set interest,
                and choose which plan should be used by default.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={addRepaymentPlan}
            className="h-13 rounded-2xl bg-white px-6 text-base font-bold text-[#0b332c] shadow-xl shadow-black/10 hover:bg-emerald-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Plan
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {watchPlans.map((plan, index) => (
          <Card
            key={plan.id}
            className={cn(
              "group overflow-hidden rounded-[2rem] border bg-white transition-all duration-300",
              plan.isDefault
                ? "border-main-green/40 shadow-2xl shadow-emerald-900/10 ring-4 ring-main-green/10"
                : "border-gray-100 shadow-xl shadow-gray-200/40 hover:border-main-green/20"
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden border-b px-6 py-6 md:px-8",
                plan.isDefault
                  ? "border-main-green/10 bg-gradient-to-r from-emerald-50 via-white to-cyan-50"
                  : "border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50"
              )}
            >
              {plan.isDefault && (
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-main-green/10 blur-2xl" />
              )}

              <div className="relative flex items-start justify-between gap-5">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all",
                      plan.isDefault
                        ? "border-main-green bg-main-green text-white shadow-lg shadow-main-green/25"
                        : "border-gray-200 bg-white text-gray-400 group-hover:border-main-green/30 group-hover:text-main-green"
                    )}
                  >
                    {plan.isDefault ? (
                      <Sparkles className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`repaymentPlans.${index}.name`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          className="h-auto border-0 bg-transparent p-0 text-2xl font-black tracking-tight text-gray-950 shadow-none outline-none placeholder:text-gray-300 focus-visible:ring-0"
                          placeholder="Plan name"
                        />
                      )}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {plan.isDefault ? (
                        <Badge className="rounded-full bg-main-green px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-none">
                          Default Plan
                        </Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultPlan(index)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-gray-500 transition hover:border-main-green/30 hover:bg-main-green/5 hover:text-main-green"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Make Default
                        </button>
                      )}

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-500">
                        {plan.durationDays} days
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold text-gray-500">
                        {plan.interestRate}% interest
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRepaymentPlan(index)}
                  className="h-11 w-11 shrink-0 rounded-2xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <CardContent className="space-y-8 p-6 md:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">
                      Target Audience
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose who can access this repayment plan.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`repaymentPlans.${index}.creditTier`}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {CREDIT_TIERS.map((tier) => {
                        const Icon = tier.icon;
                        const isSelected = field.value === tier.value;

                        return (
                          <button
                            key={tier.value}
                            type="button"
                            onClick={() => field.onChange(tier.value)}
                            className={cn(
                              "relative overflow-hidden rounded-3xl border-2 p-4 text-left transition-all",
                              isSelected
                                ? cn(
                                  tier.borderColor,
                                  tier.bgColor,
                                  tier.color,
                                  "shadow-lg"
                                )
                                : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute right-3 top-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                                  <BadgeCheck className="h-4 w-4" />
                                </div>
                              </div>
                            )}

                            <div
                              className={cn(
                                "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                                isSelected
                                  ? "bg-white shadow-sm"
                                  : "bg-gray-50 text-gray-400"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <span className="block text-sm font-black">
                              {tier.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`repaymentPlans.${index}.interestRate`}
                  render={({ field }) => (
                    <FormItem className="rounded-[1.5rem] border border-gray-100 bg-gray-50/60 p-5">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <FormLabel className="text-sm font-black uppercase tracking-[0.16em] text-gray-600">
                            Interest Rate
                          </FormLabel>
                          <FormDescription className="mt-1 text-xs">
                            Set the percentage charged on this plan.
                          </FormDescription>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-2 text-2xl font-black text-main-green shadow-sm">
                          {field.value}%
                        </div>
                      </div>

                      <FormControl>
                        <Slider
                          min={0}
                          max={50}
                          step={0.5}
                          value={[field.value]}
                          onValueChange={([val]) => field.onChange(val)}
                          className="py-4"
                        />
                      </FormControl>

                      <div className="mt-2 flex justify-between text-xs font-bold text-gray-400">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`repaymentPlans.${index}.lateFeesPercentage`}
                  render={({ field }) => (
                    <FormItem className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                          <Percent className="h-5 w-5" />
                        </div>

                        <div>
                          <FormLabel className="text-sm font-black uppercase tracking-[0.16em] text-gray-600">
                            Late Fee
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Percentage applied when repayment is late.
                          </FormDescription>
                        </div>
                      </div>

                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="h-14 rounded-2xl border-gray-200 bg-gray-50 pr-12 text-lg font-black transition-all focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/5"
                          />

                          <Percent className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`repaymentPlans.${index}.durationDays`}
                  render={({ field }) => (
                    <FormItem className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                          <CalendarDays className="h-5 w-5" />
                        </div>

                        <div>
                          <FormLabel className="text-sm font-black uppercase tracking-[0.16em] text-gray-600">
                            Duration
                          </FormLabel>
                          <FormDescription className="text-xs">
                            How long borrowers have to repay.
                          </FormDescription>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((preset) => (
                          <button
                            key={preset.days}
                            type="button"
                            onClick={() => field.onChange(preset.days)}
                            className={cn(
                              "rounded-xl border px-4 py-2 text-xs font-black transition-all",
                              field.value === preset.days
                                ? "border-main-green bg-main-green text-white shadow-lg shadow-main-green/15"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-main-green/30 hover:bg-main-green/5 hover:text-main-green"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="h-14 rounded-2xl border-gray-200 bg-gray-50 pr-20 text-lg font-black transition-all focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/5"
                          />

                          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-gray-400">
                            Days
                          </span>
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`repaymentPlans.${index}.earlyRepaymentAllowed`}
                  render={({ field }) => (
                    <FormItem className="flex min-h-[212px] items-center justify-between gap-5 rounded-[1.5rem] border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm transition hover:border-main-green/20">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            field.value
                              ? "bg-main-green text-white"
                              : "bg-gray-100 text-gray-400"
                          )}
                        >
                          <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <FormLabel className="text-base font-black text-gray-950">
                            Early Repayment
                          </FormLabel>
                          <FormDescription className="max-w-xs text-sm leading-6">
                            Allow borrowers to settle their loan before maturity without
                            blocking the plan.
                          </FormDescription>
                        </div>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}