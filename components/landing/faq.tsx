"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function Faq() {
    const faqs = [
        {
            q: "How does the automated collection work?",
            a: "Once a borrower applies and authorizes their card via Paystack, our system securely vaults the token. On each due date, we automatically attempt to charge the due amount from their card."
        },
        {
            q: "Is my money safe?",
            a: "PadiLoan is an infrastructure provider. We don't hold your lending capital. Payments go directly to your linked Paystack account, ensuring you have full control over your funds."
        },
        {
            q: "Can I use it for informal lending?",
            a: "Absolutely! PadiLoan is designed for both formal micro-finance institutions and informal lenders who want a professional way to manage loans to friends, family, or employees."
        },
        {
            q: "What happen if a payment fails?",
            a: "We automatically retry the charge multiple times and send instant notifications to both the borrower and the lender. You can also manually trigger a charge from your dashboard."
        }
    ];

    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq) => (
                        <AccordionItem key={faq.q} value={faq.q}>
                            <AccordionTrigger className="text-left text-lg font-bold">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
