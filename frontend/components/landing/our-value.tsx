import { cn } from "@/lib/utils";
import { Server, LayoutGrid, Database } from "lucide-react";

export function OurValue() {
    const values = [
        {
            icon: <Server className="size-6 text-main-green" />,
            title: "Built For Scalability",
            description: "From freelancers to startups, manage every dollar as your finances grow.",
            highlight: false
        },
        {
            icon: <LayoutGrid className="size-6 text-main-green" />,
            title: "Clarity First",
            description: "Designed to simplify, not overwhelm — with a clean UI and actionable insights.",
            highlight: true
        },
        {
            icon: <Database className="size-6 text-main-green" />,
            title: "Data-Driven Decisions",
            description: "Make smarter, data-driven decisions with powerful predictive analytics and personalized recommendations.",
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
                        What Sets MyCashNG Apart
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                        We don't just help you manage money — we empower you with clarity, control, and confidence every step of the way.
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
