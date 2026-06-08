"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { calculateRepayment } from "@/lib/utils/loan-math";

import { StepId, FormData } from "./types";
import { STEP_ORDER, slideVariants } from "./constants";

import { LoadingScreen } from "./_components/loading-screen";
import { LoanSkeleton } from "./_components/loan-skeleton";
import { NotFoundScreen } from "./_components/not-found-screen";
import { ProcessingStep } from "./_components/processing-step";
import { LandingStep } from "./_components/landing-step";
import { PhoneStep } from "./_components/phone-step";
import { EmailStep } from "./_components/email-step";
import { PasscodeStep } from "./_components/passcode-step";
import { BvnStep } from "./_components/bvn-step";
import { BankStep } from "./_components/bank-step";
import { OfferStep } from "./_components/offer-step";
import { KycStep } from "./_components/kyc-step";
import { TermsStep } from "./_components/terms-step";
import { SuccessStep } from "./_components/success-step";
import DynamicUiForLoans from "./_components/dynamic-ui-for-loans";
import { ExistingBorrowerModal } from "./_components/existing-borrower-modal";

import { Suspense } from "react";
import { SuspenseLoader } from "@/components/ui/suspense-loader";
import { BorrowerDataContext } from "../../../lib/borrower-context";
import { useConsent } from "@/lib/consent-context";
import { useMutation, useQuery } from "@tanstack/react-query";

function PublicLoanForm() {
  const data = useContext(BorrowerDataContext);
  const { consented, skipConsent } = useConsent();
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Core State
  const [currentStep, setCurrentStep] = useState<StepId>("landing");
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // console.log("DATA FROM CONTEXT,", data)
  // Form Data
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    email: "",
    fullName: "",
    dob: "",
    passcode: "",
    otp: "",
    emailOtp: "",
    bvn: "",
    address: "",
    city: "",
    state: "",
    lga: "",
    employmentType: "",
    wagesRange: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    amount: 0,
    planId: "",
    agreedToTerms: false,
  });

  // Verification States
  const [status, setStatus] = useState({
    phoneVerified: false,
    otpSent: false,
    emailVerified: false,
    emailOtpSent: false,
    bvnVerified: false,
    bankConnected: false,
    creditScoreRefreshed: false,
  });

  // Modal States
  const [showExistingBorrowerModal, setShowExistingBorrowerModal] = useState(false);
  const [existingBorrowerMessage, setExistingBorrowerMessage] = useState("");

  // Timers & Loaders
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch App Data
  const { data: app, isLoading: loading } = useQuery({
    queryKey: ["loan-app", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  useEffect(() => {
    if (app) {
      // Recover persisted data if state was lost
      const savedEmail = localStorage.getItem(`Kuipid_loan_email_${slug}`);
      const savedPhone = localStorage.getItem(`Kuipid_loan_phone_${slug}`);

      // Set default amount and plan from JSON data
      if (app.minLoanAmount) {
        setFormData((prev) => ({
          ...prev,
          email: savedEmail || prev.email,
          phone: savedPhone || prev.phone,
          amount: app.minLoanAmount,
          planId:
            app.repaymentPlans?.find((p: any) => p.isDefault)?.id ||
            app.repaymentPlans?.[0]?.id,
        }));
      }
    }
  }, [app, slug]);

  // Handle Logged-in Borrower Data (Pre-fill & Auto-skip)
  useEffect(() => {
    if (data?.borrower && !skipConsent) {
      const b = data.borrower;
      const c = data.completion;

      setFormData((prev) => ({
        ...prev,
        phone: b.phone || prev.phone,
        email: b.email || prev.email,
        fullName: `${b.firstName} ${b.lastName}`.trim(),
        dob: b.dob || prev.dob,
        bvn: b.bvn || prev.bvn,
        address: b.address || prev.address,
        city: b.city || prev.city,
        state: b.state || prev.state,
        employmentType: b.employmentType || prev.employmentType,
        wagesRange: b.monthlyIncome || prev.wagesRange,
      }));

      setStatus((prev) => ({
        ...prev,
        phoneVerified: !!b.phone,
        emailVerified: !!b.email,
        bvnVerified: c.bvnVerified,
        bankConnected: c.bankDetailsProvided,
      }));
    }
  }, [data]);


  useEffect(() => {
    const status = searchParams.get('status');
    const step = searchParams.get('step');

    if (step === 'bank') {
      setCurrentStep("bank");

    }
  }, [searchParams, formData,]);
  // OTP Countdown
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);


  console.log(currentStep, " WE ARE ON THIS SEP")
  // Helpers
  const nextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setDirection(1);
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const activePlan = useMemo(() => {
    return app?.repaymentPlans?.find((p: any) => p.id === formData.planId);
  }, [app, formData.planId]);

  const loanSummary = useMemo(() => {
    if (!activePlan || !formData.amount) return null;
    return calculateRepayment(
      formData.amount,
      activePlan.interestRate,
      Math.ceil(activePlan.durationDays / 30),
    );
  }, [activePlan, formData.amount]);

  // API Actions
  const sendOtpMutation = useMutation({
    mutationFn: async ({ type, value }: { type: "phone" | "email"; value: string }) => {
      const res = await fetch(`/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, loanAppSlug: app?.name }),
      });
      const data = await res.json();
      console.log(data, "DATA SEND OTP")
      if (!res.ok) throw data;
      return data;
    },
    onSuccess: (data, variables) => {
      if (variables.type === "phone") {
        setStatus((prev) => ({
          ...prev,
          otpSent: true,
          bvnVerified: data.bvnVerified || false,
        }));
        setOtpCountdown(60);
        toast.success("Verification code sent!");
      } else {
        setStatus((prev) => ({ ...prev, emailOtpSent: true }));
        setOtpCountdown(60);
        toast.success("Verification code sent to your email!");
      }
    },
    onError: (err: any) => {
      if (err.code === "BORROWER_ALREADY_EXISTS") {
        setExistingBorrowerMessage(err.message);
        setShowExistingBorrowerModal(true);
      } else {
        toast.error(err.message || "Failed to send code");
      }
    },
  });

  const handleSendOtp = async () => {
    sendOtpMutation.mutate({ type: "phone", value: formData.phone });
  };

  const handleVerifyOtp = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "phone",
          value: formData.phone,
          otp: formData.otp,
        }),
      });
      if (!res.ok) throw new Error("Invalid code");
      setStatus((prev) => ({ ...prev, phoneVerified: true }));
      toast.success("Phone verified!");
      if (status.bvnVerified) {
        toast.info("We noticed you have a verified account already")
        handleRefreshScore();
      } else {
        setTimeout(nextStep, 500);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    sendOtpMutation.mutate({ type: "email", value: formData.email });
  };

  const handleVerifyEmailOtp = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "email",
          value: formData.email,
          otp: formData.emailOtp,
        }),
      });
      if (!res.ok) throw new Error("Invalid email code");
      setStatus((prev) => ({ ...prev, emailVerified: true }));
      toast.success("Email verified!");
      setTimeout(nextStep, 500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyBvn = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/verify/bvn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn: formData.bvn, phone: formData.phone, email: formData.email, slug: slug }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "BVN verification failed");
      console.log(result, "reult")

      // Persist identified user details
      localStorage.setItem(`Kuipid_loan_email_${slug}`, formData.email);
      localStorage.setItem(`Kuipid_loan_phone_${slug}`, formData.phone);

      setStatus((prev) => ({ ...prev, bvnVerified: true }));
      toast.success("Identity verified!");

      // Automatically refresh score after BVN verification
      handleRefreshScore();
    } catch (err: any) {
      if (err.message === "BVN already used on this loan app with different identity details") {
        router.push("/borrower/login")
      }
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setCurrentStep("processing");
    try {
      const durationMonths = activePlan
        ? Math.ceil(activePlan.durationDays / 30)
        : undefined;

      //first submit remaining details
      await fetch(`/api/verify/profile-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
        }),
      });
      //then apply for loan
      const res = await fetch(`/api/public/${slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          appId: app.id,
          durationMonths,
          durationDays: activePlan?.durationDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      // Artificial delay for disbursement animation feel
      await new Promise((r) => setTimeout(r, 3000));
      setCurrentStep("success");
    } catch (err: any) {
      toast.error(err.message);
      setCurrentStep("terms"); // Go back to terms if failed
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshScoreMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/verify/refresh-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          bvn: formData.bvn,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    },
    onSuccess: () => {
      setStatus((prev) => ({ ...prev, creditScoreRefreshed: true }));
      toast.success("Credit profile updated!");
      // Proceed to next step automatically
      nextStep();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update credit profile");
      // Still proceed to offer, but maybe with a warning or fallback?
      // For now, let's just proceed to next step to avoid blocking the user
      nextStep();
    },
  });

  const handleRefreshScore = async () => {
    refreshScoreMutation.mutate();
  };

  function renderStep(step: StepId) {
    switch (step) {
      case "landing":
        return <LandingStep app={app} onNext={nextStep} slug={slug} />;
      case "phone":
        return (
          <PhoneStep
            formData={formData}
            status={status}
            update={updateFormData}
            onSendOtp={handleSendOtp}
            onVerify={handleVerifyOtp}
            loading={sendOtpMutation.isPending || refreshScoreMutation.isPending || actionLoading}
            countdown={otpCountdown}
            onBack={prevStep}
          />
        );
      case "email":
        return (
          <EmailStep
            formData={formData}
            status={status}
            update={updateFormData}
            onSendOtp={handleSendEmailOtp}
            onVerify={handleVerifyEmailOtp}
            loading={sendOtpMutation.isPending || actionLoading}
            countdown={otpCountdown}
            onBack={prevStep}
          />
        );
      case "passcode":
        return (
          <PasscodeStep
            formData={formData}
            update={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case "bvn":
        return (
          <BvnStep
            formData={formData}
            update={updateFormData}
            onVerify={handleVerifyBvn}
            loading={refreshScoreMutation.isPending || actionLoading}
            onBack={prevStep}
          />
        );
      case "bank":
        return (
          <BankStep
            email={formData.email}
            summary={loanSummary}
            onConnect={(data: any) => {
              updateFormData({ ...data });
              setStatus((prev) => ({ ...prev, bankConnected: true }));
              setTimeout(nextStep, 1500);
            }}
            onSkip={nextStep}
            onBack={prevStep}
          />
        );
      case "offer":
        return (
          <OfferStep
            app={app}
            formData={formData}
            update={updateFormData}
            summary={loanSummary}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case "kyc":
        return (
          <KycStep
            formData={formData}
            update={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case "terms":
        return (
          <TermsStep
            formData={formData}
            update={updateFormData}
            summary={loanSummary}
            onSubmit={handleFinalSubmit}
            onBack={prevStep}
            app={app}
          />
        );
      case "processing":
        return <ProcessingStep />;
      case "success":
        return <SuccessStep app={app} summary={loanSummary} />;
      default:
        return null;
    }
  }

  // Render Logic
  if (loading) return <LoanSkeleton />;
  if (!app) return <NotFoundScreen />;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#1F4941] selection:bg-lemon-primary/30">
      <DynamicUiForLoans
        completionStatus={data?.completion || {}}
        status={status}
        formData={formData}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onStepChange={(step, dir) => {
          setDirection(dir);
          setCurrentStep(step);
        }}
        consented={consented}
        skipConsent={skipConsent}
      >
        {(resolvedStep) => (
          <>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 z-[100]">
              <motion.div
                className="h-full bg-main-green"
                initial={{ width: 0 }}
                animate={{
                  width: `${(STEP_ORDER.indexOf(resolvedStep) / (STEP_ORDER.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>

            <main className="max-w-[480px] mx-auto px-6 pt-12 pb-24">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={resolvedStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full"
                >
                  {renderStep(resolvedStep)}
                </motion.div>
              </AnimatePresence>
            </main>

            <ExistingBorrowerModal
              isOpen={showExistingBorrowerModal}
              onClose={() => setShowExistingBorrowerModal(false)}
              slug={slug as string}
              message={existingBorrowerMessage}
            />
          </>
        )}
      </DynamicUiForLoans>
    </div>
  );
}


export default function PublicLoanPage() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <PublicLoanForm />
    </Suspense>
  );
}
