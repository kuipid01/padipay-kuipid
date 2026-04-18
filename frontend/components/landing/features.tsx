import { Zap, Clock, Shield, BarChart3, Share2, Wallet, Send } from "lucide-react";

export function Features() {
    const featureList = [
        {
            icon: <Zap className="size-5 text-main-green" />,
            title: "Instant Loan App Creation",
            description: "Launch your own fully-branded lending portal in minutes. No coding required, just set your terms and go."
        },
        {
            icon: <Share2 className="size-5 text-main-green" />,
            title: "One-Link Applications",
            description: "Share your unique loan application link via WhatsApp, Email, or Social Media. Collect borrower data effortlessly."
        },
        {
            icon: <Wallet className="size-5 text-main-green" />,
            title: "Paystack-Integrated Funding",
            description: "Securely fund your lending wallet using Paystack. Keep your capital ready for instant disbursements."
        },
        {
            icon: <Send className="size-5 text-main-green" />,
            title: "Automated & Manual Payouts",
            description: "Choose to disburse loans automatically upon acceptance or review every application manually before payout."
        }
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center">
                        <div className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white">
                            Features
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-main-green font-robotoSlab max-w-3xl mx-auto leading-tight">
                        Everything You Need To <br /> Run Your Lending Business
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                        Powerful infrastructure to help you manage borrowers, track repayments, and grow your lending portfolio with ease.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
                    {/* Left: Credit Card Illustration */}
                    <div className="bg-[#f1f6ed] rounded-[40px] p-8 sm:p-12 md:p-20 flex items-center justify-center min-h-[400px] md:min-h-[500px]">
                        <div className="w-full max-w-xs sm:max-w-md bg-[#1F4941] rounded-[24px] p-6 sm:p-8 text-white shadow-2xl space-y-8 sm:space-y-12 relative overflow-hidden group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-1.5">
                                    <div className="size-3 sm:size-4 bg-lemon-primary rounded-tr-full rounded-bl-full" />
                                    <div className="size-3 sm:size-4 bg-lemon-primary/60 rounded-tr-full rounded-bl-full translate-y-2 -translate-x-1" />
                                    <div className="size-3 sm:size-4 bg-lemon-primary rounded-tr-full rounded-bl-full" />
                                    <div className="size-3 sm:size-4 bg-lemon-primary/40 rounded-tr-full rounded-bl-full translate-y-2 -translate-x-1" />
                                </div>
                                <div className="flex gap-1 items-center opacity-80">
                                    <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white/40 rounded-full" />
                                    <div className="w-0.5 sm:w-1 h-4 sm:h-5 bg-white/60 rounded-full" />
                                    <div className="w-0.5 sm:w-1 h-6 sm:h-7 bg-white/80 rounded-full" />
                                    <div className="w-0.5 sm:w-1 h-4 sm:h-5 bg-white/60 rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight">Andrew Forbist</h3>
                            </div>

                            <div className="flex justify-between items-end pt-2 sm:pt-4">
                                <div className="space-y-1">
                                    <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-white/60 font-medium">Balance Amount</p>
                                    <p className="text-2xl sm:text-3xl font-black">$562,000</p>
                                </div>
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="text-right">
                                        <p className="text-[7px] sm:text-[8px] uppercase tracking-widest text-white/40 font-bold mb-1">Exp</p>
                                        <p className="text-xs sm:text-sm font-bold">11/29</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] sm:text-[8px] uppercase tracking-widest text-white/40 font-bold mb-1">CVV</p>
                                        <p className="text-xs sm:text-sm font-bold">323</p>
                                    </div>
                                </div>
                            </div>

                            {/* Subtle pattern */}
                            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-2xl sm:blur-3xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
                        {featureList.map((feature) => (
                            <div key={feature.title} className="flex gap-4 sm:gap-6 p-4 sm:p-6 rounded-[24px] border border-gray-100 hover:border-lemon-primary/30 hover:shadow-xl hover:shadow-lemon-primary/5 transition-all duration-300 bg-white group">
                                <div className="shrink-0 size-10 sm:size-12 rounded-[16px] bg-[#BDF49D]/20 flex items-center justify-center group-hover:bg-[#BDF49D]/40 transition-colors">
                                    {feature.icon}
                                </div>
                                <div className="space-y-1 sm:space-y-2 pt-0.5 sm:pt-1">
                                    <h3 className="text-sm sm:text-base font-bold text-main-green leading-snug">{feature.title}</h3>
                                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
