
export const PLANS = [
  {
    name: "Basic",
    monthlyPrice: 2000,
    annualPrice: 20000,
    features: [
      "Up to 50 Loan Apps",
      "Standard Dashboards",
      "Card Authorization",
      "Email Notifications",
      "Standard Support",
    ],
    buttonText: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    monthlyPrice: 9900,
    annualPrice: 99000,
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
    buttonText: "Get Started",
    featured: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: null, // "Custom"
    annualPrice: null, // "Custom"
    features: [
      "White-label Solution",
      "API Access",
      "Dedicated Account Manager",
      "Custom Verifications",
    ],
    buttonText: "Get Started",
    featured: false,
  },
] as const;

export type PlanName = (typeof PLANS)[number]["name"];

export const getPlanFeatures = (planName: PlanName) => {
  const plan = PLANS.find((p) => p.name === planName);
  return plan?.features || [];
};

export const getPlan = (planName: PlanName) => {
  return PLANS.find((p) => p.name === planName);
};
