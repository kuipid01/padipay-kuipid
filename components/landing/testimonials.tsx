import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
    const reviews = [
        {
            name: "Tega Michael",
            role: "Micro-Lender",
            text: "PadiLoan transformed how I manage my lending business. The automated collections are a life-saver!",
            avatar: "TM"
        },
        {
            name: "Sarah Ade",
            role: "Small Business Owner",
            text: "I use PadiLoan for employee soft loans. It's transparent and incredibly easy to set up.",
            avatar: "SA"
        },
        {
            name: "John Doe",
            role: "Financial Consultant",
            text: "The security features and Paystack integration make this the most reliable platform for lenders.",
            avatar: "JD"
        }
    ];

    return (
        <section className="py-24 bg-muted/20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">What Lenders Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((r) => (
                        <div key={r.name} className="p-8 rounded-2xl bg-card border shadow-sm space-y-4">
                            <p className="italic text-muted-foreground leading-relaxed">&quot;{r.text}&quot;</p>
                            <div className="flex items-center gap-3 pt-4">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{r.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold">{r.name}</div>
                                    <div className="text-xs text-muted-foreground">{r.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
