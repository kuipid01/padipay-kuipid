import * as z from "zod";
import { Sparkles, DollarSign, Calendar, CheckCircle2, Award, TrendingUp, Star, Users } from "lucide-react";

export const repaymentPlanSchema = z.object({
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

export const appSchema = z.object({
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

export type AppFormValues = z.infer<typeof appSchema>;
export type RepaymentPlan = z.infer<typeof repaymentPlanSchema>;

export const CREDIT_TIERS = [
  {
    value: "excellent",
    label: "Excellent Credit",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Highest trust, lowest risk. Reward them with lower rates."
  },
  {
    value: "good",
    label: "Good Credit",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Reliable borrowers with a solid track record."
  },
  {
    value: "fair",
    label: "Fair Credit",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Average risk profile. Standard rates usually apply."
  },
  {
    value: "all",
    label: "All Borrowers",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "Open to everyone. Best for general purpose plans."
  },
] as const;

export const STEPS = [
  {
    id: 1,
    title: "App Identity",
    description: "Brand your loan portal",
    icon: Sparkles,
    details: "Choose a name that reflects your lending brand. This will also determine the unique URL where your customers will apply for loans.",
    tips: ["Use a professional name", "Keep the slug short and easy to remember", "Check the preview to see how it looks"]
  },
  {
    id: 2,
    title: "Loan Limits",
    description: "Set your boundaries",
    icon: DollarSign,
    details: "Define the range of loan amounts you're willing to offer. You can also automate approvals for smaller, lower-risk amounts.",
    tips: ["Start small if you're new", "Require credit checks for higher amounts", "Use auto-approval for efficiency"]
  },
  {
    id: 3,
    title: "Repayment Plans",
    description: "Define the terms",
    icon: Calendar,
    details: "Create different plans for different types of borrowers. Set interest rates, durations, and late fees for each plan.",
    tips: ["Offer multiple plans for variety", "Reward good credit with better terms", "Clearly state late fee percentages"]
  },
  {
    id: 4,
    title: "Launch",
    description: "Ready for business",
    icon: CheckCircle2,
    details: "Review all your settings. Once you create the app, your loan link will be live and ready for borrowers.",
    tips: ["Double check your interest rates", "Verify your public URL", "You can always edit these later"]
  },
];
