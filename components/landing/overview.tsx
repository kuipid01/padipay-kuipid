import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function Overview() {
    const steps = [
        "Sign up as a Lender",
        "Create your loan landing page",
        "Share links with borrowers",
        "Approve applications",
        "Automate collections"
    ];

    return (
        <section className="py-24 bg-primary/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-4xl font-bold tracking-tight">How PadiLoan Works</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We provide the infrastructure. You provide the capital. Together, we make lending seamless and secure for everyone involved.
                        </p>
                        <div className="space-y-4 pt-4">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="text-primary w-6 h-6 shrink-0" />
                                    <span className="text-lg font-medium">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-lg">
                        <Card className="border-none shadow-2xl bg-card overflow-hidden">
                            <div className="h-64 bg-linear-to-br from-primary/20 to-violet-500/20 flex items-center justify-center p-8">
                                <div className="w-full h-full border-4 border-dashed border-primary/20 rounded-xl animate-pulse" />
                            </div>
                            <CardContent className="p-8 space-y-4">
                                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                                <div className="h-10 w-full bg-primary/10 rounded animate-pulse mt-4" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
