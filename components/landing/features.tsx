import { ShieldCheck, Zap, Wallet } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to manage your lending business effectively.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="h-10 w-10 text-primary" />}
                        title="Instant Loan Links"
                        description="Create a loan app and get a public link to share with your borrowers in seconds."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                        title="Automated Collections"
                        description="Never chase payments manually again. We automate repayments using Paystack."
                    />
                    <FeatureCard
                        icon={<Wallet className="h-10 w-10 text-primary" />}
                        title="Detailed Dashboards"
                        description="Track every app, application, and repayment with real-time analytics."
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, description }: Readonly<{ icon: React.ReactNode, title: string, description: string }>) {
    return (
        <div className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 group">
            <div className="mb-6 p-3 rounded-xl bg-primary/5 w-fit group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
