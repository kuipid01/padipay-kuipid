import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Overview() {
    const gridItems = [
        {
            title: "1. Brand & Customize",
            description: "Setup your professional lending portal in seconds. Add your branding, define your loan products, and set your interest rates to match your business model.",
            illustration: (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 w-full max-w-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-main-green text-sm italic font-robotoSlab">Lending Portal</h4>
                        <div className="text-[10px] font-bold text-gray-400 border rounded px-2 py-1 italic">V 2.0</div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Family Loans", icon: "🏠", progress: 85, vol: "₦1.2M" },
                            { label: "Business Credit", icon: "💼", progress: 40, vol: "₦3.5M" }
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "2. Fund Your Wallet",
            description: "Securely fund your lending capital via Paystack. Your wallet is the engine that powers your disbursements, keeping your liquidity ready for Every borrower.",
            illustration: (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <div className="z-10 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 w-full max-w-[260px] space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="size-8 rounded-lg bg-lemon-primary/20 flex items-center justify-center">
                                <div className="size-4 rounded-full border-2 border-main-green border-t-transparent animate-spin-slow" />
                            </div>
                            <div className="size-1 rounded-full bg-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-main-green bg-lemon-primary/30 px-2 py-0.5 rounded w-fit">Wallet Balance</p>
                            <h4 className="text-2xl font-black text-main-green">₦5,000,000</h4>
                            <p className="text-xs text-gray-500 font-medium">Ready for disbursement</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Share & Collect",
            description: "Share your unique loan application link via WhatsApp or email. Borrowers fill in their details and authorize their cards for automated future repayments.",
            illustration: (
                <div className="relative size-48 md:size-64 flex items-center justify-center">
                    <div className="size-36 md:size-48 rounded-full border-[15px] md:border-[20px] border-gray-100 relative">
                        <div className="absolute inset-[-15px] md:inset-[-20px] rounded-full border-[15px] md:border-[20px] border-main-green border-t-transparent border-l-transparent rotate-45" />
                        <div className="absolute inset-[-15px] md:inset-[-20px] rounded-full border-[15px] md:border-[20px] border-lemon-primary border-t-transparent border-r-transparent border-b-transparent -rotate-12" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Approval Rate</p>
                            <h4 className="text-xl font-black text-main-green">94.2%</h4>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "4. Verify & Disburse",
            description: "Review incoming applications in real-time. Once approved, the system automatically disburses funds to the borrower's bank account instantly.",
            illustration: (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 w-full max-w-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-main-green text-sm italic font-robotoSlab">Recent Payouts</h4>
                        <div className="text-[10px] font-bold text-gray-400 border rounded px-2 py-1">Live Feed</div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { name: "John Doe", amount: "₦50,000", status: "Successful" },
                            { name: "Jane Smith", amount: "₦120,000", status: "Successful" },
                            { name: "Alex K.", amount: "₦25,000", status: "Successful" }
                        ].map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-main-green">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">{p.amount}</p>
                                </div>
                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{p.status}</span>
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
                    <h2 className="text-4xl md:text-5xl font-black text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight">
                        Your Lending Business, <br /> Streamlined.
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        Follow our simple 4-step process to launch your lending brand and automate your entire operation from funding to payout.
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
