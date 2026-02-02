"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ThumbsUp, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Plans() {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Free",
            monthlyPrice: "0",
            annualPrice: "0",
            features: [
                "Up to 3 Loan Apps",
                "Basic Dashboards",
                "Card Authorization",
                "Standard Support"
            ],
            icon: ThumbsUp,
            buttonText: "Get Started",
            featured: false
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
                "Automated SMS Reminders"
            ],
            icon: Award,
            buttonText: "Get Started",
            featured: true
        },
        {
            name: "Enterprise",
            monthlyPrice: "Custom",
            annualPrice: "Custom",
            features: [
                "White-label Solution",
                "API Access",
                "Dedicated Account Manager",
                "Custom Verifications"
            ],
            icon: Zap,
            buttonText: "Get Started",
            featured: false
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-white">
            <div className="container mx-auto px-4 text-center">
                <div className="flex flex-col items-center mb-12">
                    <div className="px-4 py-1.5 rounded-full border border-gray-100 bg-white shadow-sm text-xs font-medium text-gray-500 mb-6">
                        Pricing
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 text-main-green leading-tight">
                        Choose The Plan That <br /> Fits Your Finances
                    </h2>
                    <p className="text-gray-500 max-w-2xl text-lg">
                        Simple, affordable pricing for individuals and growing teams.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="bg-gray-100/50 p-1 rounded-full flex items-center gap-1 border border-gray-200">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer",
                                !isAnnual ? "bg-lemon-primary text-main-green shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer",
                                isAnnual ? "bg-lemon-primary text-main-green shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Annual
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {plans.map((p, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={p.name}
                            className={cn(
                                "relative p-8 md:p-10 rounded-[40px] border flex flex-col items-start text-left transition-all duration-300",
                                p.featured
                                    ? "bg-main-green text-white border-transparent shadow-2xl md:scale-105 z-10"
                                    : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                            )}
                        >
                            <div className="mb-8 flex flex-col gap-6">
                                <div className={cn(
                                    "p-3 rounded-xl w-fit",
                                    p.featured ? "bg-white/10" : "bg-main-green"
                                )}>
                                    <p.icon className={cn("w-6 h-6", "text-lemon-primary")} />
                                </div>

                                <div>
                                    <h3 className={cn(
                                        "text-2xl font-black mb-2",
                                        p.featured ? "text-white" : "text-main-green"
                                    )}>
                                        {p.name}
                                    </h3>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className={cn(
                                        "text-3xl font-bold align-top mt-1",
                                        p.featured ? "text-white" : "text-black"
                                    )}>
                                        {p.monthlyPrice !== "Custom" && "₦"}
                                    </span>
                                    <span className={cn(
                                        "text-5xl font-black",
                                        p.featured ? "text-white" : "text-black"
                                    )}>
                                        {isAnnual ? p.annualPrice : p.monthlyPrice}
                                    </span>
                                    {p.monthlyPrice !== "Custom" && (
                                        <span className={cn(
                                            "text-lg font-medium",
                                            p.featured ? "text-white/60" : "text-gray-400"
                                        )}>
                                            / {isAnnual ? "Year" : "Month"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                className={cn(
                                    "w-full mb-10 h-14 rounded-2xl text-lg font-black transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                                    "bg-lemon-primary text-main-green hover:bg-lemon-primary/90 shadow-lg shadow-lemon-primary/20",
                                    p.featured && "border-none"
                                )}
                            >
                                {p.buttonText}
                            </Button>

                            <div className="space-y-5 w-full">
                                <p className={cn(
                                    "text-sm font-black uppercase tracking-wider",
                                    p.featured ? "text-white/80" : "text-gray-900"
                                )}>
                                    Features
                                </p>
                                {p.features.map((f, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={f}
                                        className="flex items-center gap-3"
                                    >
                                        <div className={cn(
                                            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                                            p.featured ? "bg-lemon-primary" : "bg-main-green"
                                        )}>
                                            <Check className={cn(
                                                "w-3.5 h-3.5",
                                                p.featured ? "text-main-green" : "text-lemon-primary"
                                            )} strokeWidth={4} />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            p.featured ? "text-white/90" : "text-gray-600"
                                        )}>
                                            {f}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
