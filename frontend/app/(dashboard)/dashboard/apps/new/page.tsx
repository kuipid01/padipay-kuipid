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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  },
  {
    value: "good",
    label: "Good Credit",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    value: "fair",
    label: "Fair Credit",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    value: "all",
    label: "All Borrowers",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

const DURATION_PRESETS = [
  { days: 30, label: "30 Days" },
  { days: 60, label: "60 Days" },
  { days: 90, label: "3 Months" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
];

const FEATURES = [
  { icon: Zap, text: "Instant loan application link" },
  { icon: Shield, text: "Secure card authorization" },
  { icon: Users, text: "Automatic borrower management" },
];

export default function NewLoanAppPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
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
  const previewUrl = `padiloan.com/loan/${watchSlug || "your-slug"}`;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/apps">
            <Button
              variant="ghost"
              className="mb-4 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apps
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Loan App
          </h1>
          <p className="text-lg text-gray-600">
            Set up a comprehensive loan application portal with flexible
            repayment options
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 rounded-2xl p-1">
                    <TabsTrigger
                      value="basic"
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="plans"
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Repayment Plans
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="mt-6">
                    <Card className="border-gray-100 shadow-lg rounded-3xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Sparkles className="h-6 w-6 text-main-green" />
                          App Configuration
                        </CardTitle>
                        <CardDescription className="text-base">
                          Configure the basic settings for this loan portal
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* App Name */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-gray-700">
                                App Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    onNameChange(e);
                                  }}
                                  placeholder="e.g., Small Business Loans"
                                  className="h-14 rounded-2xl border-gray-100 shadow-sm text-lg font-medium focus:border-main-green focus:ring-main-green/20"
                                />
                              </FormControl>
                              <FormDescription>
                                A descriptive name to identify this loan app in
                                your dashboard
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Custom Slug */}
                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-gray-700">
                                Custom URL Slug
                              </FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2 p-2 border border-gray-100 rounded-2xl shadow-sm focus-within:border-main-green focus-within:ring-2 focus-within:ring-main-green/20">
                                  <LinkIcon className="h-5 w-5 text-gray-400 ml-2" />
                                  <span className="text-sm text-gray-500 whitespace-nowrap">
                                    padiloan.com/loan/
                                  </span>
                                  <Input
                                    {...field}
                                    placeholder="your-custom-slug"
                                    className="border-0 shadow-none focus-visible:ring-0 text-lg font-medium"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                This will be the public link you share with
                                borrowers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Loan Amounts */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minLoanAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold text-gray-700">
                                  Minimum Amount
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                      className="h-14 pl-11 rounded-2xl border-gray-100 shadow-sm text-lg font-bold focus:border-main-green focus:ring-main-green/20"
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
                                <FormLabel className="text-base font-semibold text-gray-700">
                                  Maximum Amount
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                      className="h-14 pl-11 rounded-2xl border-gray-100 shadow-sm text-lg font-bold focus:border-main-green focus:ring-main-green/20"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Repayment Plans Tab */}
                  <TabsContent value="plans" className="mt-6 space-y-4">
                    <Card className="border-gray-100 shadow-lg rounded-3xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                              <Calendar className="h-6 w-6 text-main-green" />
                              Repayment Plans
                            </CardTitle>
                            <CardDescription className="text-base">
                              Create flexible repayment options based on
                              creditworthiness
                            </CardDescription>
                          </div>
                          <Button
                            type="button"
                            onClick={addRepaymentPlan}
                            variant="outline"
                            className="rounded-xl border-main-green text-main-green hover:bg-main-green hover:text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Plan
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {watchPlans.map((plan, index) => (
                          <Card
                            key={plan.id}
                            className={cn(
                              "border-2 rounded-2xl transition-all",
                              plan.isDefault
                                ? "border-main-green bg-green-50/50"
                                : "border-gray-200"
                            )}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FormField
                                    control={form.control}
                                    name={`repaymentPlans.${index}.name`}
                                    render={({ field }) => (
                                      <Input
                                        {...field}
                                        className="font-semibold text-lg border-0 shadow-none focus-visible:ring-1 focus-visible:ring-main-green p-0 h-auto"
                                      />
                                    )}
                                  />
                                  {plan.isDefault && (
                                    <Badge className="bg-main-green text-white">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {!plan.isDefault && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDefaultPlan(index)}
                                      className="text-xs"
                                    >
                                      Set as Default
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRepaymentPlan(index)}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Credit Tier */}
                              <FormField
                                control={form.control}
                                name={`repaymentPlans.${index}.creditTier`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                      Credit Tier Eligibility
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl">
                                          <SelectValue placeholder="Select credit tier" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {CREDIT_TIERS.map((tier) => {
                                          const Icon = tier.icon;
                                          return (
                                            <SelectItem
                                              key={tier.value}
                                              value={tier.value}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Icon
                                                  className={cn(
                                                    "h-4 w-4",
                                                    tier.color
                                                  )}
                                                />
                                                <span>{tier.label}</span>
                                              </div>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Duration */}
                              <FormField
                                control={form.control}
                                name={`repaymentPlans.${index}.durationDays`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                      Repayment Duration
                                    </FormLabel>
                                    <div className="space-y-3">
                                      <div className="flex gap-2 flex-wrap">
                                        {DURATION_PRESETS.map((preset) => (
                                          <Button
                                            key={preset.days}
                                            type="button"
                                            variant={
                                              field.value === preset.days
                                                ? "default"
                                                : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                              field.onChange(preset.days)
                                            }
                                            className={cn(
                                              "rounded-lg",
                                              field.value === preset.days &&
                                                "bg-main-green hover:bg-main-green/90"
                                            )}
                                          >
                                            {preset.label}
                                          </Button>
                                        ))}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <Input
                                          type="number"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              Number(e.target.value)
                                            )
                                          }
                                          className="h-11 rounded-xl"
                                          placeholder="Custom days"
                                        />
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                          days
                                        </span>
                                      </div>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Interest Rate */}
                              <FormField
                                control={form.control}
                                name={`repaymentPlans.${index}.interestRate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center justify-between">
                                      <FormLabel className="text-sm font-medium">
                                        Interest Rate
                                      </FormLabel>
                                      <span className="text-2xl font-bold text-main-green">
                                        {field.value}%
                                      </span>
                                    </div>
                                    <FormControl>
                                      <Slider
                                        min={0}
                                        max={50}
                                        step={0.5}
                                        value={[field.value]}
                                        onValueChange={([value]) =>
                                          field.onChange(value)
                                        }
                                        className="py-4"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Additional Settings */}
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <FormField
                                  control={form.control}
                                  name={`repaymentPlans.${index}.earlyRepaymentAllowed`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                                      <div>
                                        <FormLabel className="text-sm font-medium">
                                          Early Repayment
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                          Allow early payoff
                                        </FormDescription>
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

                                <FormField
                                  control={form.control}
                                  name={`repaymentPlans.${index}.lateFeesPercentage`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium">
                                        Late Fees %
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) =>
                                              field.onChange(
                                                Number(e.target.value)
                                              )
                                            }
                                            className="h-11 rounded-xl pr-8"
                                          />
                                          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Advanced Settings Tab */}
                  <TabsContent value="advanced" className="mt-6">
                    <Card className="border-gray-100 shadow-lg rounded-3xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Shield className="h-6 w-6 text-main-green" />
                          Advanced Settings
                        </CardTitle>
                        <CardDescription className="text-base">
                          Configure additional options and automation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="allowCustomAmounts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">
                                  Allow Custom Loan Amounts
                                </FormLabel>
                                <FormDescription>
                                  Let borrowers request any amount within your
                                  limits
                                </FormDescription>
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

                        <FormField
                          control={form.control}
                          name="requireCreditCheck"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base font-semibold">
                                  Require Credit Check
                                </FormLabel>
                                <FormDescription>
                                  Verify borrower creditworthiness before
                                  approval
                                </FormDescription>
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

                        <FormField
                          control={form.control}
                          name="autoApprovalLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-gray-700">
                                Auto-Approval Limit
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                    className="h-14 pl-11 rounded-2xl border-gray-100 shadow-sm text-lg font-bold focus:border-main-green focus:ring-main-green/20"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span>
                                  Loans below this amount will be automatically
                                  approved for qualified borrowers
                                </span>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <Card className="border-gray-100 shadow-lg rounded-3xl bg-main-green text-white">
                  <CardContent className="p-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-16 text-lg font-semibold bg-white text-main-green hover:bg-gray-50 rounded-2xl shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Create Loan App
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <Card className="border-gray-100 shadow-lg rounded-3xl overflow-hidden sticky top-8">
              <div className="bg-main-green p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Live Preview</h3>
                </div>
                <p className="text-sm text-green-50">Your Public Link</p>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Share this URL</p>
                  <code className="text-sm font-mono text-gray-900 break-all">
                    {previewUrl}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={copyPreviewUrl}
                  >
                    {copied ? (
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    asChild
                  >
                    <a
                      href={`https://${previewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plan Summary Card */}
            <Card className="border-gray-100 shadow-lg rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-main-green" />
                  Plan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchPlans.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No plans created yet
                  </p>
                ) : (
                  watchPlans.map((plan, index) => {
                    const tier = CREDIT_TIERS.find(
                      (t) => t.value === plan.creditTier
                    );
                    const TierIcon = tier?.icon || Users;
                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "p-3 rounded-xl border-2",
                          plan.isDefault
                            ? "border-main-green bg-green-50"
                            : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TierIcon
                              className={cn("h-4 w-4", tier?.color)}
                            />
                            <p className="font-semibold text-sm">
                              {plan.name}
                            </p>
                          </div>
                          {plan.isDefault && (
                            <Badge className="bg-main-green text-white text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-semibold">
                              {plan.durationDays} days
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Interest</p>
                            <p className="font-semibold text-main-green">
                              {plan.interestRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-gray-100 shadow-lg rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-main-green" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {FEATURES.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-main-green" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-blue-100 bg-blue-50/50 shadow-lg rounded-3xl">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-sm text-blue-700">
                      Create multiple plans for different credit tiers to
                      maximize approvals while managing risk effectively.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}