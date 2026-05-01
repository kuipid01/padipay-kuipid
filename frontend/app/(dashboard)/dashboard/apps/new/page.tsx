"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"
// Local imports
import { appSchema, AppFormValues, STEPS } from "./_lib/schema";
import { StepInfo } from "./_components/step-info";
import { StepIdentity } from "./_components/step-identity";
import { StepLimits } from "./_components/step-limits";
import { StepPlans } from "./_components/step-plans";
import { StepReview } from "./_components/step-review";
import { FormNavigation } from "./_components/form-navigation";

export default function NewLoanAppPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      minLoanAmount: 1000,
      maxLoanAmount: 50000,
      requireCreditCheck: false,
      autoApprovalLimit: 5000,
    },
  });

  const { mutate: createLoanApp, isPending } = useMutation({
    mutationFn: async (values: AppFormValues) => {
      const res = await fetch("/api/loan-apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create loan app");
      return data;
    },
    onSuccess: () => {
      toast.success("Loan app created successfully!");
      router.push("/dashboard/apps");
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const onSubmit = () => {
    form.handleSubmit((values) => {
      createLoanApp(values);
    })();
  };

  const goToNext = async () => {
    let fieldsToValidate: (keyof AppFormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ["name", "slug"];
    if (currentStep === 2) fieldsToValidate = ["minLoanAmount", "maxLoanAmount"];
    if (currentStep === 3) fieldsToValidate = ["repaymentPlans"];

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const goToPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isSideCollapsed, setIsSideCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Side: Information & Progress */}
      <motion.div
        animate={{
          width: typeof window !== 'undefined' && window.innerWidth >= 768
            ? (isSideCollapsed ? "80px" : "35%")
            : "100%"
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "bg-main-green md:h-screen md:sticky md:top-0 rounded-b-[32px] md:rounded-none overflow-hidden shadow-2xl shadow-green-900/20 z-20 relative flex-shrink-0",
          isSideCollapsed && "md:rounded-r-3xl"
        )}
      >
        <StepInfo
          currentStep={currentStep}
          isSideCollapsed={isSideCollapsed}
          onToggleCollapse={() => setIsSideCollapsed(!isSideCollapsed)}
        />
      </motion.div>

      {/* Right Side: Form Content */}
      <div className="flex-1 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 md:px-12 md:py-16">
          {/* Header Actions */}
          <div className="mb-12 flex items-center justify-between">
            <Link href="/dashboard/apps">
              <Button variant="ghost" className="rounded-2xl text-gray-400 hover:text-gray-900 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
          </div>

          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && <StepIdentity form={form} />}
              {currentStep === 2 && <StepLimits form={form} />}
              {currentStep === 3 && <StepPlans form={form} />}
              {currentStep === 4 && <StepReview form={form} />}

              <FormNavigation
                currentStep={currentStep}
                goToPrev={goToPrev}
                goToNext={goToNext}
                isLoading={isPending}
                onSubmit={onSubmit}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}