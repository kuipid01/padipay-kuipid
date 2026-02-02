import { cn } from "@/lib/utils";
import Image from "next/image";

export function Integrations() {
    const tools = [
        { name: "Asana", icon: "/asana.svg" },
        { name: "Zoom", icon: "/zoom.svg" },
        { name: "Gmail", icon: "/gmail.svg" },
        { name: "Zendesk", icon: "/zendesk.svg" },
        { name: "Loom", icon: "/loom.svg" },
        { name: "Paypal", icon: "/paypal.svg" },
        { name: "Excel", icon: "/excel.svg" },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Integrations
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight">
                        Seamless Integrations With Your Favorite Tools
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                        Sync effortlessly across banking, payment, and productivity platforms.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 max-w-5xl mx-auto">
                    {tools.map((tool) => (
                        <div key={tool.name} className="group transition-all duration-300 hover:scale-110">
                            {/* Using div placeholders with colors for icons for now since SVGs aren't available */}
                            <div className="size-12 md:size-16 rounded-xl bg-gray-50 flex items-center justify-center p-3 border border-gray-100 group-hover:border-lemon-primary/50 group-hover:shadow-lg transition-all">
                                <span className="text-xs font-black text-gray-400 group-hover:text-main-green">{tool.name[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
