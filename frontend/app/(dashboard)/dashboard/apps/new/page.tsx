"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Percent,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Zap,
  Shield,
  Users,
  Plus,
  Trash2,
  Star,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Info,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "../../../../../components/ui/slider";

const repaymentPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Plan name is required"),
  durationDays: z.number().min(1).max(730),
  interestRate: z.number().min(0).max(100),
  creditTier: z.enum(["excellent", "good", "fair", "all"]),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  earlyRepaymentAllowed: z.boolean(),
  lateFeesPercentage: z.number().min(0).max(50),
  isDefault: z.boolean(),
});

const appSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  repaymentPlans: z
    .array(repaymentPlanSchema)
    .min(1, "At least one repayment plan is required"),
  allowCustomAmounts: z.boolean(),
  minLoanAmount: z.number().min(0),
  maxLoanAmount: z.number().min(0),
  requireCreditCheck: z.boolean(),
  autoApprovalLimit: z.number().min(0).optional(),
});

type AppFormValues = z.infer<typeof appSchema>;
type RepaymentPlan = z.infer<typeof repaymentPlanSchema>;

const CREDIT_TIERS = [
  {
    value: "excellent",
    label: "Excellent Credit",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "good",
    label: "Good Credit",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "fair",
    label: "Fair Credit",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    value: "all",
    label: "All Borrowers",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

const DURATION_PRESETS = [
  { days: 30, label: "30d" },
  { days: 60, label: "60d" },
  { days: 90, label: "3mo" },
  { days: 180, label: "6mo" },
  { days: 365, label: "1yr" },
];

const STEPS = [
  {
    id: 1,
    title: "App Identity",
    description: "Name your loan app",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Loan Limits",
    description: "Set amount boundaries",
    icon: DollarSign,
  },
  {
    id: 3,
    title: "Repayment Plans",
    description: "Define plan options",
    icon: Calendar,
  },
  {
    id: 4,
    title: "Review & Create",
    description: "Confirm and launch",
    icon: CheckCircle2,
  },
];

export default function NewLoanAppPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm<AppFormValues>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      name: "",
      slug: "",
      repaymentPlans: [
        {
          id: "plan-1",
          name: "Standard Plan",
          durationDays: 30,
          interestRate: 10,
          creditTier: "all",
          earlyRepaymentAllowed: true,
          lateFeesPercentage: 5,
          isDefault: true,
        },
      ],
      allowCustomAmounts: true,
      minLoanAmount: 100,
      maxLoanAmount: 10000,
      requireCreditCheck: false,
      autoApprovalLimit: 1000,
    },
  });

  const watchSlug = form.watch("slug");
  const watchPlans = form.watch("repaymentPlans");
  const watchName = form.watch("name");
  const watchMin = form.watch("minLoanAmount");
  const watchMax = form.watch("maxLoanAmount");
  const watchAutoApproval = form.watch("autoApprovalLimit");
  const watchAllowCustom = form.watch("allowCustomAmounts");
  const watchCreditCheck = form.watch("requireCreditCheck");
  const previewUrl = `MyCashNG.com/loan/${watchSlug || "your-slug"}`;

  async function onSubmit(values: AppFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/loan-apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create loan app");
      }

      toast.success("Loan app created successfully!");
      router.push("/dashboard/apps");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value);
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    form.setValue("slug", slug, { shouldValidate: true });
  };

  const copyPreviewUrl = () => {
    navigator.clipboard.writeText(`https://${previewUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const addRepaymentPlan = () => {
    const currentPlans = form.getValues("repaymentPlans");
    const newPlan: RepaymentPlan = {
      id: `plan-${Date.now()}`,
      name: `Plan ${currentPlans.length + 1}`,
      durationDays: 60,
      interestRate: 12,
      creditTier: "all",
      earlyRepaymentAllowed: true,
      lateFeesPercentage: 5,
      isDefault: false,
    };
    form.setValue("repaymentPlans", [...currentPlans, newPlan]);
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

  const goToNext = async () => {
    let fieldsToValidate: (keyof AppFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ["name", "slug"];
    if (currentStep === 2) fieldsToValidate = ["minLoanAmount", "maxLoanAmount"];

    const valid = await form.trigger(fieldsToValidate as any);
    if (valid) setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const goToPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/apps">
            <Button variant="ghost" className="mb-4 hover:bg-gray-100 rounded-xl text-gray-600 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apps
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Loan App</h1>
          <p className="text-gray-500">Follow the steps below to set up your loan portal</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-main-green z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className="relative z-10 flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-sm",
                      isCompleted
                        ? "bg-main-green border-main-green text-white"
                        : isActive
                        ? "bg-white border-main-green text-main-green shadow-lg shadow-green-100"
                        : "bg-white border-gray-200 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={cn("text-xs font-semibold", isActive ? "text-gray-900" : "text-gray-400")}>
                      {step.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>

            {/* ── STEP 1: App Identity ── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Name your loan app</h2>
                  <p className="text-sm text-gray-500 mt-1">Give your app a memorable name — it'll auto-generate your public link.</p>
                </div>

                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardContent className="p-6 space-y-5">
                    {/* App Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-gray-700">App Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => { field.onChange(e); onNameChange(e); }}
                              placeholder="e.g., Small Business Loans"
                              className="h-12 rounded-xl border-gray-200 focus:border-main-green focus:ring-main-green/20 text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Slug */}
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-gray-700">Public URL</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden focus-within:border-main-green focus-within:ring-2 focus-within:ring-main-green/20 transition-all">
                              <span className="bg-gray-50 px-3 py-3 text-sm text-gray-400 border-r border-gray-200 whitespace-nowrap h-12 flex items-center">
                                MyCashNG.com/loan/
                              </span>
                              <Input
                                {...field}
                                placeholder="your-slug"
                                className="border-0 shadow-none focus-visible:ring-0 h-12 rounded-none text-base font-medium"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>This is the link borrowers will use to apply</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Preview */}
                    {watchSlug && (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                        <LinkIcon className="h-4 w-4 text-main-green flex-shrink-0" />
                        <code className="text-sm text-gray-700 font-mono flex-1 truncate">{previewUrl}</code>
                        <button type="button" onClick={copyPreviewUrl} className="text-main-green hover:text-green-700 transition-colors">
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── STEP 2: Loan Limits ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Set loan boundaries</h2>
                  <p className="text-sm text-gray-500 mt-1">Define the min and max amounts borrowers can request, plus automation settings.</p>
                </div>

                <Card className="border-gray-100 shadow-sm rounded-2xl">
                  <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minLoanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">Min Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="h-12 pl-8 rounded-xl border-gray-200 font-semibold"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxLoanAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-700">Max Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="h-12 pl-8 rounded-xl border-gray-200 font-semibold"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <FormField
                        control={form.control}
                        name="allowCustomAmounts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <FormLabel className="font-semibold text-sm cursor-pointer">Allow Custom Amounts</FormLabel>
                              <FormDescription className="text-xs">Borrowers choose within your limits</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requireCreditCheck"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <FormLabel className="font-semibold text-sm cursor-pointer">Require Credit Check</FormLabel>
                              <FormDescription className="text-xs">Verify creditworthiness before approval</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="autoApprovalLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-gray-700">Auto-Approval Limit</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₦</span>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-12 pl-8 rounded-xl border-gray-200 font-semibold"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="flex items-start gap-1.5 text-xs">
                            <Info className="h-3.5 w-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                            Loans below this amount auto-approve for qualified borrowers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ── STEP 3: Repayment Plans ── */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Repayment Plans</h2>
                    <p className="text-sm text-gray-500 mt-1">Create one or more plans. Each plan can target a specific credit tier.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={addRepaymentPlan}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-main-green text-main-green hover:bg-main-green hover:text-white flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Plan
                  </Button>
                </div>

                <div className="space-y-4">
                  {watchPlans.map((plan, index) => (
                    <Card
                      key={plan.id}
                      className={cn(
                        "border-2 rounded-2xl transition-all shadow-sm",
                        plan.isDefault ? "border-main-green" : "border-gray-100"
                      )}
                    >
                      {/* Plan header */}
                      <div className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-t-2xl",
                        plan.isDefault ? "bg-main-green/5" : "bg-gray-50"
                      )}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FormField
                            control={form.control}
                            name={`repaymentPlans.${index}.name`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className="font-semibold border-0 shadow-none focus-visible:ring-1 focus-visible:ring-main-green p-0 h-auto bg-transparent text-gray-900"
                              />
                            )}
                          />
                          {plan.isDefault && (
                            <Badge className="bg-main-green text-white text-xs flex-shrink-0">Default</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!plan.isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultPlan(index)}
                              className="text-xs h-7 px-2 text-gray-500 hover:text-main-green"
                            >
                              Set default
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRepaymentPlan(index)}
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        {/* Credit Tier */}
                        <FormField
                          control={form.control}
                          name={`repaymentPlans.${index}.creditTier`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credit Tier</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {CREDIT_TIERS.map((tier) => {
                                  const Icon = tier.icon;
                                  const isSelected = field.value === tier.value;
                                  return (
                                    <button
                                      key={tier.value}
                                      type="button"
                                      onClick={() => field.onChange(tier.value)}
                                      className={cn(
                                        "flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all text-sm",
                                        isSelected
                                          ? `${tier.borderColor} ${tier.bgColor} ${tier.color} font-semibold`
                                          : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                                      )}
                                    >
                                      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", isSelected ? tier.color : "text-gray-400")} />
                                      <span className="truncate text-xs">{tier.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          {/* Duration */}
                          <FormField
                            control={form.control}
                            name={`repaymentPlans.${index}.durationDays`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</FormLabel>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {DURATION_PRESETS.map((preset) => (
                                    <button
                                      key={preset.days}
                                      type="button"
                                      onClick={() => field.onChange(preset.days)}
                                      className={cn(
                                        "px-2 py-1 rounded-lg text-xs font-medium border transition-all",
                                        field.value === preset.days
                                          ? "bg-main-green text-white border-main-green"
                                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                                      )}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-9 rounded-lg text-sm"
                                  />
                                  <span className="text-xs text-gray-400 whitespace-nowrap">days</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Late Fees */}
                          <FormField
                            control={form.control}
                            name={`repaymentPlans.${index}.lateFeesPercentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Late Fee %</FormLabel>
                                <div className="relative mt-7">
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-9 rounded-lg pr-8 text-sm"
                                  />
                                  <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Interest Rate */}
                        <FormField
                          control={form.control}
                          name={`repaymentPlans.${index}.interestRate`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interest Rate</FormLabel>
                                <span className="text-lg font-bold text-main-green">{field.value}%</span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={50}
                                  step={0.5}
                                  value={[field.value]}
                                  onValueChange={([value]) => field.onChange(value)}
                                  className="py-3"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Early Repayment */}
                        <FormField
                          control={form.control}
                          name={`repaymentPlans.${index}.earlyRepaymentAllowed`}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div>
                                <FormLabel className="text-sm font-semibold cursor-pointer">Early Repayment</FormLabel>
                                <FormDescription className="text-xs">Allow borrowers to pay off early</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Create ── */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Review your loan app</h2>
                  <p className="text-sm text-gray-500 mt-1">Everything looks good? Hit create to go live.</p>
                </div>

                {/* App Summary */}
                <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                  <div className="bg-main-green px-5 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{watchName || "—"}</p>
                        <p className="text-green-100 text-sm font-mono">{previewUrl}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    {/* Limits row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-100">
                      <div className="pr-4">
                        <p className="text-xs text-gray-400 mb-0.5">Min Loan</p>
                        <p className="font-bold text-gray-900">₦{watchMin?.toLocaleString()}</p>
                      </div>
                      <div className="px-4">
                        <p className="text-xs text-gray-400 mb-0.5">Max Loan</p>
                        <p className="font-bold text-gray-900">₦{watchMax?.toLocaleString()}</p>
                      </div>
                      <div className="pl-4">
                        <p className="text-xs text-gray-400 mb-0.5">Auto-Approve</p>
                        <p className="font-bold text-gray-900">₦{watchAutoApproval?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap gap-2">
                      {watchAllowCustom && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                          Custom Amounts
                        </span>
                      )}
                      {watchCreditCheck && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          Credit Check Required
                        </span>
                      )}
                    </div>

                    {/* Plans */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {watchPlans.length} Repayment {watchPlans.length === 1 ? "Plan" : "Plans"}
                      </p>
                      <div className="space-y-2">
                        {watchPlans.map((plan) => {
                          const tier = CREDIT_TIERS.find((t) => t.value === plan.creditTier);
                          const TierIcon = tier?.icon || Users;
                          return (
                            <div
                              key={plan.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border",
                                plan.isDefault ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <TierIcon className={cn("h-4 w-4 flex-shrink-0", tier?.color)} />
                                <span className="font-semibold text-sm truncate">{plan.name}</span>
                                {plan.isDefault && <Badge className="bg-main-green text-white text-xs flex-shrink-0">Default</Badge>}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                                <span className="font-semibold text-main-green">{plan.interestRate}%</span>
                                <span>{plan.durationDays}d</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Public Link */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Public Link</p>
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <code className="text-sm font-mono text-gray-700 flex-1 truncate">{previewUrl}</code>
                        <button type="button" onClick={copyPreviewUrl} className="text-main-green hover:text-green-700 transition-colors flex-shrink-0">
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <a href={`https://${previewUrl}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What you get */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Zap, text: "Instant loan link" },
                    { icon: Shield, text: "Secure card auth" },
                    { icon: Users, text: "Auto borrower mgmt" },
                  ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 text-center">
                        <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-main-green" />
                        </div>
                        <span className="text-xs text-gray-600 font-medium leading-tight">{f.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={goToPrev}
                disabled={currentStep === 1}
                className="rounded-xl text-gray-600 disabled:opacity-0"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      s.id === currentStep ? "w-5 h-2 bg-main-green" : s.id < currentStep ? "w-2 h-2 bg-main-green/40" : "w-2 h-2 bg-gray-200"
                    )}
                  />
                ))}
              </div>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={goToNext}
                  className="rounded-xl bg-main-green hover:bg-main-green/90 text-white px-6"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-main-green hover:bg-main-green/90 text-white px-8 h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create Loan App
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}