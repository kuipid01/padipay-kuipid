export default function PrivacyPage() {
    return (
        <section className="bg-white pt-28 pb-20 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-4 mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-main-green/5 border border-main-green/10 text-main-green text-[10px] font-black uppercase tracking-widest">
                        Legal Document
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-main-green leading-tight font-robotoSlab">
                        Privacy<span className="text-lemon-primary">Policy</span>
                    </h1>
                    <p className="text-gray-500 font-medium font-robotoSlab">Last Updated: April 18, 2026</p>
                </div>

                <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Kuipid is committed to protecting your privacy and handling your data responsibly.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">2. Information We Collect</h2>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-main-green italic">Personal Information</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-main-green italic">Financial Information</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Transaction records</li>
                                <li>Wallet activity</li>
                            </ul>
                            <p className="text-sm font-bold text-main-green bg-lemon-primary/20 p-4 rounded-xl">
                                (Payment details are handled by Paystack and are not stored by us)
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-main-green italic">Technical Information</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>IP address</li>
                                <li>Device information</li>
                                <li>Browser type</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">3. How We Use Information</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">We use your data to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide and improve our services</li>
                            <li>Facilitate loan agreements</li>
                            <li>Process transactions</li>
                            <li>Prevent fraud and abuse</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">4. Payment Processing</h2>
                        <p className="leading-relaxed">All payments are securely processed by <strong>Paystack</strong>.</p>
                        <p className="leading-relaxed font-black text-main-green">We do not store or have access to your full card details.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">5. Data Sharing</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">We may share data with:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Payment processors</li>
                            <li>Service providers</li>
                            <li>Law enforcement where required</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">6. Data Retention</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">We retain data only as long as necessary to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide services</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">7. Data Security</h2>
                        <p className="leading-relaxed">
                            We implement reasonable security measures to protect your data. However, no system is completely secure.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">8. Your Rights</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">You may:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Request access to your data</li>
                            <li>Request corrections</li>
                            <li>Request deletion (subject to legal obligations)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">9. Children’s Privacy</h2>
                        <p className="leading-relaxed italic font-bold">
                            Kuipid is not intended for users under 18 years old.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">10. Changes to Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy periodically. Continued use means acceptance of changes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">11. Contact</h2>
                        <p className="leading-relaxed font-bold">Email: support@Kuipid.com</p>
                    </section>

                    <div className="p-10 rounded-[2.5rem] bg-amber-50 border border-amber-100 space-y-6 mt-16 shadow-2xl shadow-amber-900/5">
                        <div className="flex items-center gap-3 text-amber-700">
                            <h4 className="font-black uppercase text-xs tracking-widest">⚠️ Final Reality Check</h4>
                        </div>
                        <p className="text-amber-900/80 font-bold italic leading-relaxed">
                            Your mention of “enforcement mechanisms” is where things get serious. In Nigeria, that can cross into:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-amber-900/70 text-sm font-medium">
                            <li>Debt collection regulation</li>
                            <li>Lending licensing</li>
                            <li>Consumer protection laws</li>
                        </ul>
                        <p className="text-amber-900/80 text-sm font-bold">
                            If your enforcement includes auto-debiting accounts, reporting users, or restricting access based on debt — please ensure professional legal review.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
