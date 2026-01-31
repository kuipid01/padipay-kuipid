import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Overview() {
    const gridItems = [
        {
            title: "Portfolio Performance Tracking",
            description: "Monitor your active loan portfolio in real-time. Track total disbursements, accrued interest, and overall ROI with precision to ensure your lending business stays profitable.",
            illustration: (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="absolute left-4 rotate-[-4deg] opacity-40 scale-75 bg-white rounded-2xl p-4 shadow-sm border w-48 h-32 hidden lg:block" />
                    <div className="absolute right-4 rotate-[4deg] opacity-40 scale-75 bg-white rounded-2xl p-4 shadow-sm border w-48 h-32 hidden lg:block" />
                    <div className="z-10 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 w-full max-w-[260px] space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="size-8 rounded-lg bg-lemon-primary/20 flex items-center justify-center">
                                <div className="size-4 rounded-full border-2 border-main-green border-t-transparent animate-spin-slow" />
                            </div>
                            <div className="size-1 rounded-full bg-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-main-green bg-lemon-primary/30 px-2 py-0.5 rounded w-fit">Active Portfolio</p>
                            <h4 className="text-2xl font-black text-main-green">₦4.2M</h4>
                            <p className="text-xs text-gray-500 font-medium">Total Interests Earned</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Automated Repayment Cycles",
            description: "Visualize collection trends and analyze monthly repayment cycles. Our automated system helps you track upcoming installments and manage cash flow effortlessly.",
            illustration: (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 w-full max-w-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-main-green text-sm italic">Collection Rate</h4>
                        <div className="text-[10px] font-bold text-gray-400 border rounded px-2 py-1">Monthly</div>
                    </div>
                    <div className="flex items-end justify-between gap-1.5 h-32">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 55].map((h, i) => (
                            <div key={i} className="flex-1 space-y-1 group">
                                <div className="w-full bg-lemon-primary/30 rounded-t-sm group-hover:bg-main-green transition-colors" style={{ height: `${h * 0.6}%` }} />
                                <div className="w-full bg-main-green/10 rounded-t-sm group-hover:bg-lemon-primary transition-colors" style={{ height: `${h * 0.4}%` }} />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Disbursed This Month</p>
                            <p className="text-lg font-black text-main-green">₦840,000</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-main-green" />
                                <span className="text-[10px] font-bold text-gray-600">Collected</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-lemon-primary" />
                                <span className="text-[10px] font-bold text-gray-600">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Risk Analysis & Health Metrics",
            description: "Mitigate risks with intelligent credit scoring and health monitoring. Gain a 360-degree view of borrower behavior and portfolio delinquency rates at a glance.",
            illustration: (
                <div className="relative size-48 md:size-64 flex items-center justify-center">
                    <div className="size-36 md:size-48 rounded-full border-[15px] md:border-[20px] border-gray-100 relative">
                        <div className="absolute inset-[-15px] md:inset-[-20px] rounded-full border-[15px] md:border-[20px] border-main-green border-t-transparent border-l-transparent rotate-45" />
                        <div className="absolute inset-[-15px] md:inset-[-20px] rounded-full border-[15px] md:border-[20px] border-lemon-primary border-t-transparent border-r-transparent border-b-transparent -rotate-12" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Success Rate</p>
                            <h4 className="text-xl font-black text-main-green">98.4%</h4>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Smart Loan Management",
            description: "Create and manage diverse loan products with ease. From personal micro-loans to business credit, track performance metrics for every product category you offer.",
            illustration: (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 w-full max-w-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-main-green text-sm">Loan Products</h4>
                        <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1">+ New Product</button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Micro-Credit", icon: "💰", progress: 85, vol: "₦1.2M" },
                            { label: "Business Capital", icon: "�", progress: 40, vol: "₦3.5M" }
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border border-gray-50 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm">{item.icon}</div>
                                        <span className="text-xs font-bold text-main-green">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-main-green">{item.vol}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-main-green rounded-full" style={{ width: `${item.progress}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <span>Utilized: {item.progress}%</span>
                                        <span>Capacity Limit</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Smarter Infrastructure
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight italic">
                        The Operating System for <br /> Your Lending Business
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Scale your lending operations with industrial-grade tools that automate disbursements, track repayments, and manage risk in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-20 max-w-7xl mx-auto">
                    {gridItems.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="space-y-8 group"
                        >
                            <div className="bg-[#f1f6ed] rounded-[40px] p-6 md:p-12 flex items-center justify-center min-h-[350px] md:min-h-[450px] overflow-hidden">
                                <div className="transition-all duration-700 group-hover:scale-105 group-hover:rotate-1 w-full flex justify-center">
                                    {item.illustration}
                                </div>
                            </div>
                            <div className="space-y-4 px-2">
                                <h3 className="text-2xl md:text-3xl font-black text-main-green font-robotoSlab tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 font-medium text-md md:text-lg leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
