import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Plans() {
    const plans = [
        {
            name: "Free",
            price: "0",
            features: ["Up to 3 Loan Apps", "Basic Dashboards", "Card Authorization", "Standard Support"]
        },
        {
            name: "Pro",
            price: "9,900",
            features: ["Unlimited Loan Apps", "Custom Branding", "Advanced Analytics", "Priority Support", "Automated SMS Reminders"],
            featured: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["White-label Solution", "API Access", "Dedicated Account Manager", "Custom Verifications"]
        }
    ];

    return (
        <section className="py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
                <p className="text-muted-foreground mb-16 text-lg">Scale your lending business without operational headaches.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((p) => (
                        <div
                            key={p.name}
                            className={`p-10 rounded-3xl border flex flex-col items-start text-left transition-all duration-300 ${p.featured ? "ring-2 ring-primary bg-primary/5 shadow-xl scale-105" : "bg-card hover:border-primary/50"}`}
                        >
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">₦</span>
                                    <span className="text-5xl font-black">{p.price}</span>
                                    {p.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                                </div>
                            </div>
                            <div className="space-y-4 mb-10 w-full">
                                {p.features.map((f) => (
                                    <div key={f} className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-1 rounded-full"><Check className="w-4 h-4 text-primary" /></div>
                                        <span className="text-sm font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant={p.featured ? "default" : "outline"} className="w-full mt-auto h-12 text-lg font-bold">
                                Get Started
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
