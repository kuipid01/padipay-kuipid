"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ThumbsUp, Award, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

export function Plans({ headerShown = true }: { headerShown?: boolean }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const { user } = useUser();

  const currentPlan = user?.plan;
  const isSubscribed = user?.subscriptionStatus === "active";

  const handleSubscribe = async (planName: string, price: string) => {
    if (price === "Custom") {
      router.push("/contact?plan=enterprise");
      return;
    }

    setLoadingPlan(planName);

    try {
      const amount = Number.parseFloat(price.replaceAll(",", ""));

      const res = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planName,
          billingCycle: isAnnual ? "annual" : "monthly",
          amount,
          callbackUrl: `${globalThis.location.origin}/subscription/success`,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to initialize subscription");

      const paymentUrl = data.data?.authorizationUrl || data.data?.paymentUrl;
      if (paymentUrl) {
        globalThis.location.href = paymentUrl;
      } else {
        router.push(`/subscription/success?plan=${planName}`);
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
      toast.error(err.message || "Failed to start subscription. Please try again.");
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Basic",
      monthlyPrice: "2,000",
      annualPrice: "20,000",
      features: [
        "Up to 50 Loan Apps",
        "Standard Dashboards",
        "Card Authorization",
        "Email Notifications",
        "Standard Support",
      ],
      icon: ThumbsUp,
      buttonText: "Get Started",
      featured: false,
    },
    {
      name: "Pro",
      monthlyPrice: "9,900",
      annualPrice: "99,000",
      features: [
        "Unlimited Loan Apps",
        "Custom Branding",
        "Advanced Analytics",
        "Priority Support",
        "Automated SMS Reminders",
        "Fraud Detection",
        "Team Management",
        "Export to Excel/PDF",
      ],
      icon: Award,
      buttonText: "Get Started",
      featured: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      features: [
        "White-label Solution",
        "API Access",
        "Dedicated Account Manager",
        "Custom Verifications",
      ],
      icon: Zap,
      buttonText: "Contact Us",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white overflow-x-clip relative">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {headerShown && (
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block px-4 py-1.5 mb-5 rounded-full border border-gray-200 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-600">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-5 text-main-green leading-tight">
              Choose The Plan That <br className="hidden sm:inline" /> Powers Your Lending
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-base sm:text-lg font-medium">
              Simple, infrastructure-grade pricing for lenders of all sizes. No hidden fees.
            </p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-10 md:mb-16">
          <div className="inline-flex items-center p-1.5 bg-gray-100/70 rounded-full border border-gray-200 shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-5 sm:px-7 py-2 rounded-full text-sm font-bold transition-all",
                !isAnnual
                  ? "bg-white shadow-sm text-main-green"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-5 sm:px-7 py-2 rounded-full text-sm font-bold transition-all",
                isAnnual
                  ? "bg-white shadow-sm text-main-green"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div
          className={cn(
            "grid gap-6 md:gap-10 lg:gap-12",
            isTablet ? "grid-cols-2" : "grid-cols-1",
            isDesktop ? "grid-cols-3" : ""
          )}
        >
          {plans.map((plan, idx) => {
            const isActive = currentPlan === plan.name && isSubscribed;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "relative rounded-[2.5rem] p-8 md:p-10 flex flex-col border transition-all duration-300 h-full",
                  plan.featured
                    ? "bg-main-green text-white border-transparent shadow-[0_20px_50px_rgba(31,73,65,0.2)] md:scale-105 lg:scale-110 z-10"
                    : "bg-white border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1",
                  isActive && "ring-4 ring-offset-4 ring-lemon-primary/70"
                )}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lemon-primary text-main-green px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide shadow-md">
                    Current Plan
                  </div>
                )}

                <div className="flex flex-col gap-6 mb-8">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      plan.featured ? "bg-white/15" : "bg-main-green/10"
                    )}
                  >
                    <plan.icon
                      className={cn(
                        "w-6 h-6",
                        plan.featured ? "text-lemon-primary" : "text-main-green"
                      )}
                    />
                  </div>

                  <h3
                    className={cn(
                      "text-2xl md:text-3xl font-black",
                      plan.featured ? "text-white" : "text-main-green"
                    )}
                  >
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5">
                    {price !== "Custom" && (
                      <span
                        className={cn(
                          "text-2xl md:text-3xl font-bold",
                          plan.featured ? "text-white/90" : "text-gray-700"
                        )}
                      >
                        ₦
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-4xl md:text-5xl font-black tracking-tight",
                        plan.featured ? "text-white" : "text-black"
                      )}
                    >
                      {price}
                    </span>
                    {price !== "Custom" && (
                      <span
                        className={cn(
                          "text-base md:text-lg font-medium mt-1",
                          plan.featured ? "text-white/60" : "text-gray-500"
                        )}
                      >
                        /{isAnnual ? "year" : "month"}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => !isActive && handleSubscribe(plan.name, price)}
                  disabled={loadingPlan === plan.name || isActive}
                  className={cn(
                    "w-full h-14 rounded-2xl text-base md:text-lg font-black mb-8 md:mb-10 transition-all",
                    isActive
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : plan.featured
                        ? "bg-lemon-primary hover:bg-lemon-primary/90 text-main-green shadow-lg shadow-lemon-primary/30"
                        : "bg-main-green hover:bg-main-green/90 text-white shadow-md",
                    "disabled:opacity-70 active:scale-[0.98]"
                  )}
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isActive ? (
                    "Active Plan"
                  ) : (
                    plan.buttonText
                  )}
                </Button>

                <div className="mt-auto space-y-4">
                  <p
                    className={cn(
                      "text-xs md:text-sm font-black uppercase tracking-wider mb-4",
                      plan.featured ? "text-white/80" : "text-gray-800"
                    )}
                  >
                    What's included
                  </p>

                  {plan.features.map((feature, i) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5",
                          plan.featured ? "bg-lemon-primary" : "bg-main-green/10"
                        )}
                      >
                        <Check
                          className={cn(
                            "w-4 h-4",
                            plan.featured ? "text-main-green" : "text-main-green"
                          )}
                          strokeWidth={3.5}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm md:text-base",
                          plan.featured ? "text-white/95" : "text-gray-700"
                        )}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}