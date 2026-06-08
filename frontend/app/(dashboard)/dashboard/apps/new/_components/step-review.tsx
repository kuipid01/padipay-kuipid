"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  ArrowRight,
  BadgeCheck,
  Wallet,
  Timer,
  Percent,
  Rocket,
  Settings2,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AppFormValues, CREDIT_TIERS } from "../_lib/schema";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StepReviewProps {
  form: UseFormReturn<AppFormValues>;
}

export function StepReview({ form }: StepReviewProps) {
  const [copied, setCopied] = useState(false);

  const values = form.getValues();
  const previewUrl = `Kuipid.com/loan/${values.slug || "your-slug"}`;

  const copyPreviewUrl = async () => {
    await navigator.clipboard.writeText(`https://${previewUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const defaultPlan = values.repaymentPlans.find((plan) => plan.isDefault);

  const stats = [
    {
      label: "Minimum Loan",
      value: `₦${values.minLoanAmount?.toLocaleString() || "0"}`,
      icon: Wallet,
      helper: "Lowest amount borrowers can request",
      className: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      label: "Maximum Loan",
      value: `₦${values.maxLoanAmount?.toLocaleString() || "0"}`,
      icon: Shield,
      helper: "Highest amount available in this app",
      className: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Auto Approval",
      value: `₦${values.autoApprovalLimit?.toLocaleString() || "0"}`,
      icon: Zap,
      helper: "Qualified loans below this can auto-approve",
      className: "bg-emerald-50 text-main-green border-emerald-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 md:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-main-green/10 blur-3xl" />
        <div className="absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit rounded-full border border-main-green/10 bg-main-green/5 px-4 py-1.5 text-main-green shadow-none">
              Final Step
            </Badge>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                Review & Launch
              </h2>
              <p className="max-w-2xl text-base leading-7 text-gray-500">
                Confirm your loan limits, repayment plans, borrower settings, and
                public link before creating the app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-main-green text-white">
              <Rocket className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Ready Status
              </p>
              <p className="text-sm font-black text-gray-950">
                Ready to create
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#06251f] via-[#0b3a31] to-[#071f1b] px-8 py-9 text-white md:px-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.18]">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:28px_28px]" />
          </div>

          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>

              <div className="min-w-0 space-y-3">
                <div>
                  <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-100/70">
                    Loan Portal
                  </p>
                  <h3 className="truncate text-3xl font-black tracking-tight md:text-4xl">
                    {values.name || "Untitled App"}
                  </h3>
                </div>

                <div className="flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/10 px-4 py-2 text-emerald-50/85 backdrop-blur">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate font-mono text-sm font-bold">
                    {previewUrl}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-black">
                  {values.repaymentPlans.length}
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-50/70">
                  Plans
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-black">
                  {defaultPlan?.interestRate ?? 0}%
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-50/70">
                  Default APR
                </p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="space-y-10 p-6 md:p-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="group rounded-[1.75rem] border border-gray-100 bg-gray-50/50 p-5 transition-all hover:-translate-y-0.5 hover:border-main-green/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50"
                >
                  <div
                    className={cn(
                      "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105",
                      stat.className
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {stat.helper}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-gray-700">
                  <Settings2 className="h-4 w-4 text-main-green" />
                  App Settings
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Extra rules enabled for this loan app.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4",
                  values.allowCustomAmounts
                    ? "border-amber-100 bg-amber-50/70"
                    : "border-gray-100 bg-gray-50"
                )}
              >
                <div>
                  <p className="font-black text-gray-950">
                    Custom Amounts
                  </p>
                  <p className="text-sm text-gray-500">
                    Borrowers choose within your limits
                  </p>
                </div>

                {values.allowCustomAmounts ? (
                  <Badge className="rounded-full bg-amber-500 text-white shadow-none">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-full shadow-none">
                    Off
                  </Badge>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4",
                  values.requireCreditCheck
                    ? "border-blue-100 bg-blue-50/70"
                    : "border-gray-100 bg-gray-50"
                )}
              >
                <div>
                  <p className="font-black text-gray-950">
                    Credit Check
                  </p>
                  <p className="text-sm text-gray-500">
                    Verify borrower eligibility first
                  </p>
                </div>

                {values.requireCreditCheck ? (
                  <Badge className="rounded-full bg-blue-500 text-white shadow-none">
                    Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-full shadow-none">
                    Off
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-gray-700">
                  <Users className="h-4 w-4 text-main-green" />
                  Repayment Plans
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {values.repaymentPlans.length} plan
                  {values.repaymentPlans.length === 1 ? "" : "s"} configured for
                  borrower selection.
                </p>
              </div>

              {defaultPlan && (
                <Badge className="w-fit rounded-full bg-main-green px-4 py-2 text-white shadow-none">
                  Default: {defaultPlan.name}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {values.repaymentPlans.map((plan) => {
                const tier = CREDIT_TIERS.find((t) => t.value === plan.creditTier);
                const TierIcon = tier?.icon || Users;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "group rounded-[1.75rem] border p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-200/40",
                      plan.isDefault
                        ? "border-main-green/30 bg-main-green/[0.04]"
                        : "border-gray-100 bg-white hover:border-main-green/20"
                    )}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={cn(
                            "flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                            tier?.bgColor || "bg-gray-50"
                          )}
                        >
                          <TierIcon
                            className={cn("h-6 w-6", tier?.color || "text-gray-500")}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-black text-gray-950">
                              {plan.name}
                            </p>

                            {plan.isDefault && (
                              <Badge className="h-6 rounded-full bg-main-green px-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-none">
                                Default
                              </Badge>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                              <Users className="h-3.5 w-3.5" />
                              {tier?.label || "All borrowers"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                              <Timer className="h-3.5 w-3.5" />
                              {plan.durationDays} days
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                              <Percent className="h-3.5 w-3.5" />
                              {plan.lateFeesPercentage}% late fee
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 rounded-2xl bg-gray-50 px-5 py-4 md:min-w-[180px]">
                        <div>
                          <p className="text-2xl font-black text-main-green">
                            {plan.interestRate}%
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Interest
                          </p>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-main-green" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-gray-950 p-6 text-white md:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-main-green/20 blur-3xl" />
            <div className="absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                  Your Live Link
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Share this public URL with borrowers after launch.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <LinkIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  <code className="truncate text-sm font-bold text-emerald-300 md:text-base">
                    https://{previewUrl}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex">
                  <button
                    type="button"
                    onClick={copyPreviewUrl}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 font-bold text-white transition hover:bg-white/10"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-main-green" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copy
                      </>
                    )}
                  </button>

                  <a
                    href={`https://${previewUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-main-green px-5 font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-main-green/90"
                  >
                    Open
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}