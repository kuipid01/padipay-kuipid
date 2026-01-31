import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
    const reviews = [
        {
            name: "Clara Nguyen",
            role: "Freelance Consultant",
            text: "Coinest completely changed the way I handle money. I used to feel overwhelmed tracking expenses, but now everything is organized and automated. I even reached my emergency fund goal three months ahead of schedule thanks to the smart saving plan widgets and real-time budgeting insights.",
            avatar: "CN",
            company: "Logoipsum"
        },
        {
            name: "David Emerson",
            role: "Founder, BudgetBento",
            text: "As a founder managing multiple income streams, I needed clarity without complexity. Coinest gives me full visibility into where my money goes and what needs attention. The finance score and visual breakdowns help me stay financially healthy without getting lost in spreadsheets.",
            avatar: "DE",
            company: "Logoipsum"
        }
    ];

    return (
        <section className="py-24 bg-[#f1f6ed]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Testimonial
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight">
                        Discover The Power Of Real-Time Financial Insights
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                        Stay ahead of your financial goals with intelligent tools that track, analyze, and simplify your daily money decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {reviews.map((r) => (
                        <div key={r.name} className="p-6 sm:p-10 rounded-[32px] bg-white border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-full bg-main-green/80 flex items-center justify-center">
                                        <div className="size-4 bg-lemon-primary rounded-tr-xl rounded-bl-xl" />
                                    </div>
                                    <span className="font-black text-xl text-main-green tracking-tight">{r.company}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed font-nunito">
                                    {r.text}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-6">
                                <Avatar className="size-12 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-lemon-primary text-main-green font-bold text-sm">{r.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <div className="font-black text-sm text-main-green">{r.name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
