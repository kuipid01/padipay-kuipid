import { cn } from "@/lib/utils";
import { Server, LayoutGrid, Database } from "lucide-react";

export function OurValue() {
    const values = [
        {
            icon: <Server className="size-6 text-main-green" />,
            title: "Scalable Infrastructure",
            description: "From personal loans for family to high-growth lending startups, our platform scales with your capital.",
            highlight: false
        },
        {
            icon: <LayoutGrid className="size-6 text-main-green" />,
            title: "Launch In Minutes",
            description: "No technical expertise required. Setup your lending portal, brand it, and start disbursements instantly.",
            highlight: true
        },
        {
            icon: <Database className="size-6 text-main-green" />,
            title: "Automated Collections",
            description: "Say goodbye to manual tracking. Our system handles repayment reminders and automated card charges via Paystack.",
            highlight: false
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Our Value
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight">
                        Why Choose Kuipid?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                        We provide the underlying tools and security so you can focus on building relationships and growing your lending portfolio.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className={cn(
                                "rounded-[40px] p-8 md:p-10 flex flex-col items-center text-center space-y-6 transition-transform duration-300 hover:-translate-y-2",
                                v.highlight
                                    ? "bg-lemon-primary text-main-green shadow-xl shadow-lemon-primary/20 md:scale-105 z-10"
                                    : "bg-[#f1f6ed] text-main-green"
                            )}
                        >
                            <div className={cn(
                                "size-16 rounded-full flex items-center justify-center",
                                v.highlight ? "bg-white" : "bg-[#BDF49D]/40"
                            )}>
                                {v.icon}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-black font-robotoSlab leading-tight">
                                    {v.title}
                                </h3>
                                <p className={cn(
                                    "text-sm font-medium leading-relaxed px-2",
                                    v.highlight ? "text-main-green shadow-sm" : "text-gray-500"
                                )}>
                                    {v.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
