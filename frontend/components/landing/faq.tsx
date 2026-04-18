"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Faq() {
    const faqSections = [
        {
            title: "Pricing & Trial",
            items: [
                {
                    q: "Is there a free trial?",
                    a: "Yes, you can use our lending infrastructure free for 30 days with full access to all tools."
                },
                {
                    q: "Do I need a card to start the free trial?",
                    a: "No, you do not need a card to start your free trial."
                },
                {
                    q: "Can I cancel anytime?",
                    a: "Yes, you can cancel your subscription at any time."
                },
                {
                    q: "What happens after the trial ends?",
                    a: "After the 30-day trial, you’ll need to subscribe to continue using the platform. You can check the pricing tab for available plans."
                }
            ]
        },
        {
            title: "Payments & Charges",
            items: [
                {
                    q: "When can I charge a borrower?",
                    a: "Lenders can only charge borrowers after the due date has been reached."
                },
                {
                    q: "Can I manually charge a borrower?",
                    a: "Yes, you can manually trigger a charge from your dashboard."
                },
                {
                    q: "Are borrowers notified before charges?",
                    a: "No, borrowers are not notified before charges are made."
                },
                {
                    q: "What happens if a payment fails?",
                    a: "You can retry charges manually from your dashboard."
                },
                {
                    q: "Can borrowers pay early?",
                    a: "Yes, borrowers can make payments before the due date."
                },
                {
                    q: "Are partial payments allowed?",
                    a: "Yes, partial payments can be made."
                }
            ]
        },
        {
            title: "Security & Trust",
            items: [
                {
                    q: "Do you store card details?",
                    a: "No, we do not store any card details."
                },
                {
                    q: "Who controls the funds?",
                    a: "All funds are controlled by Paystack and go directly to your account."
                },
                {
                    q: "What happens in case of disputes?",
                    a: "We work directly with company representatives to resolve any issues."
                }
            ]
        },
        {
            title: "Usage & Flexibility",
            items: [
                {
                    q: "Can this be used for family or friend loans?",
                    a: "Absolutely! MyCashNG is designed to provide the infrastructure for any individual or business wanting to manage structured lending, whether to family, friends, or customers."
                },
                {
                    q: "Who can use MyCashNG?",
                    a: "It works for both businesses and individuals."
                },
                {
                    q: "Is there a limit to borrowers?",
                    a: "Yes, the number of borrowers you can manage depends on your subscription tier."
                },
                {
                    q: "Can repayment schedules be customized?",
                    a: "No, repayment schedules cannot be fully customized."
                },
                {
                    q: "Can borrowers update their card details?",
                    a: "Yes, borrowers can add new card details when needed."
                },
                {
                    q: "Can I track everything?",
                    a: "Yes, all loans, repayments, and activity are tracked in your dashboard."
                }
            ]
        }
    ];

    return (
        <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-main-green/5 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-lemon-primary/5 blur-[120px] -z-10" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Column: Title */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-main-green/5 border border-main-green/10 text-main-green text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-main-green mr-2 animate-pulse" />
                            Frequently Asked
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                            Frequently <br />
                            Asked <br />
                            <span className="text-main-green">Questions</span>
                        </h2>

                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm">
                            Everything you need to know about our lending infrastructure, Paystack integration, and automated collections.
                        </p>
                    </motion.div>

                    {/* Right Column: Accordion */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-8"
                    >
                        <Accordion type="multiple" className="w-full space-y-6">
                            {faqSections.map((section, i) => (
                                <AccordionItem
                                    key={i}
                                    value={`section-${i}`}
                                    className="border border-gray-100 rounded-2xl px-6 py-4 bg-white shadow-sm"
                                >
                                    <AccordionTrigger className="text-xl font-bold text-gray-900 hover:no-underline">
                                        {section.title}
                                    </AccordionTrigger>

                                    <AccordionContent className="pt-4">
                                        <Accordion type="single" collapsible className="space-y-3">
                                            {section.items.map((faq, j) => (
                                                <AccordionItem
                                                    key={j}
                                                    value={`item-${i}-${j}`}
                                                    className="border border-gray-100 rounded-xl px-4"
                                                >
                                                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                                                        {faq.q}
                                                    </AccordionTrigger>

                                                    <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-4">
                                                        {faq.a}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
