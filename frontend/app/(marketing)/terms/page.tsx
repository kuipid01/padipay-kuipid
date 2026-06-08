export default function TermsPage() {
    return (
        <section className="bg-white pt-28 pb-20 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="space-y-4 mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-main-green/5 border border-main-green/10 text-main-green text-[10px] font-black uppercase tracking-widest">
                        Legal Document
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-main-green leading-tight font-robotoSlab">
                        Terms of <span className="text-lemon-primary">Service</span>
                    </h1>
                    <p className="text-gray-500 font-medium font-robotoSlab">Last Updated: April 18, 2026</p>
                </div>

                <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">1. Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to Kuipid (“Platform”, “we”, “our”, “us”), a financial infrastructure platform that enables users to create, manage, and facilitate loan agreements between individuals.
                        </p>
                        <p className="leading-relaxed">
                            By accessing or using Kuipid, you agree to be bound by these Terms of Service (“Terms”). If you do not agree, you must not use the Platform.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">2. Nature of the Service</h2>
                        <p className="leading-relaxed font-bold text-main-green">Kuipid provides tools that allow users to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Create loan agreements</li>
                            <li>Share loan offers via links</li>
                            <li>Facilitate disbursement and repayment of loans</li>
                        </ul>
                        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 space-y-3">
                            <h4 className="text-red-600 font-black uppercase text-xs tracking-widest">IMPORTANT:</h4>
                            <ul className="list-disc pl-5 space-y-2 text-red-900/80 text-sm font-medium">
                                <li>Kuipid is not a bank, lender, or credit provider</li>
                                <li>We do not originate or fund loans</li>
                                <li>We do not guarantee repayment of any loan</li>
                                <li>All loan agreements exist strictly between users</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">3. Definitions</h2>
                        <ul className="space-y-3">
                            <li className="leading-relaxed"><strong>“User”:</strong> Any individual or entity using the Platform</li>
                            <li className="leading-relaxed"><strong>“Lender”:</strong> A user who creates and funds a loan</li>
                            <li className="leading-relaxed"><strong>“Borrower”:</strong> A user who accepts and receives a loan</li>
                            <li className="leading-relaxed"><strong>“Loan Agreement”:</strong> A contract created between lender and borrower</li>
                            <li className="leading-relaxed"><strong>“Wallet”:</strong> A stored value account used to fund and receive payments</li>
                            <li className="leading-relaxed"><strong>“Payment Processor”:</strong> Third-party provider facilitating payments (e.g. Paystack)</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">4. Eligibility</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">To use Kuipid, you must:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Be at least 18 years old</li>
                            <li>Provide accurate and complete information</li>
                            <li>Comply with all applicable laws in Nigeria</li>
                        </ul>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">5. User Responsibilities</h2>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-main-green italic">Lenders agree to:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Independently assess borrower risk</li>
                                <li>Define loan terms (amount, duration, interest, penalties)</li>
                                <li>Fund loans through the Platform wallet</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-main-green italic">Borrowers agree to:</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Provide accurate personal and financial information</li>
                                <li>Repay loans according to agreed terms</li>
                                <li>Accept responsibility for penalties where applicable</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">6. Loan Creation and Acceptance</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Lenders may create loan offers and share them via unique links</li>
                            <li>Borrowers must review and accept all terms before disbursement</li>
                            <li>Upon acceptance, the loan agreement becomes binding between the lender and borrower only</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">7. Wallet and Payments</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Users fund wallets via our integrated payment processor (e.g. Paystack)</li>
                            <li>Kuipid does not store card or sensitive payment details</li>
                            <li>Payment processing is subject to the terms of the payment processor</li>
                        </ul>
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                            <h4 className="text-gray-400 font-black uppercase text-xs tracking-widest">We are not responsible for:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm font-medium">
                                <li>Payment delays</li>
                                <li>Processor errors</li>
                                <li>Bank-related failures</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">8. Disbursement of Loans</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">Loans may be disbursed:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Automatically upon borrower acceptance, or</li>
                            <li>Manually by the lender</li>
                        </ul>
                        <p className="leading-relaxed">Disbursement is executed based solely on user instructions.</p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">9. Repayment and Enforcement</h2>
                        <p className="leading-relaxed">Borrowers are required to repay loans as agreed.</p>
                        <div className="space-y-4">
                            <p className="leading-relaxed font-bold text-main-green italic">The Platform may provide:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Payment reminders</li>
                                <li>Automated repayment tools</li>
                                <li>Enforcement mechanisms for eligible (“Pro”) users</li>
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-100 space-y-3">
                            <h4 className="text-yellow-700 font-black uppercase text-xs tracking-widest">HOWEVER:</h4>
                            <ul className="list-disc pl-5 space-y-2 text-yellow-900/80 text-sm font-medium">
                                <li>Kuipid does not guarantee successful recovery of funds</li>
                                <li>Enforcement tools do not constitute legal enforcement or debt collection services</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">10. Interest and Penalties</h2>
                        <div className="space-y-4">
                            <p className="leading-relaxed font-bold text-main-green italic">Lenders may set:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Interest rates</li>
                                <li>Penalty interest for late payments</li>
                            </ul>
                        </div>
                        <p className="leading-relaxed font-bold">Users are responsible for ensuring such terms comply with applicable laws in Nigeria.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">11. Fees</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Kuipid charges transaction-based fees for use of the Platform</li>
                            <li>Additional fees may apply via payment processors</li>
                        </ul>
                        <p className="leading-relaxed">All applicable fees will be disclosed before transaction completion.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">12. Prohibited Use</h2>
                        <p className="leading-relaxed font-bold text-main-green italic">Users must not:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Engage in fraud or misrepresentation</li>
                            <li>Use the Platform for illegal lending activities</li>
                            <li>Impersonate others</li>
                            <li>Circumvent fees or system controls</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">13. Risk Disclosure</h2>
                        <div className="p-8 rounded-[2rem] bg-orange-50 border border-orange-100 space-y-4">
                            <h4 className="text-orange-700 font-black uppercase text-xs tracking-widest">Lending carries inherent financial risk.</h4>
                            <p className="text-orange-900/80 font-bold italic leading-relaxed">By using Kuipid, you acknowledge that:</p>
                            <ul className="list-disc pl-5 space-y-2 text-orange-900/80 text-sm font-medium">
                                <li>Borrowers may default</li>
                                <li>You may lose funds</li>
                                <li>The Platform does not insure or guarantee any transaction</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">14. Limitation of Liability</h2>
                        <p className="leading-relaxed font-bold text-main-green italic text-sm uppercase tracking-widest">To the fullest extent permitted by law, Kuipid shall not be liable for:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Loan defaults or non-payment</li>
                            <li>Disputes between users</li>
                            <li>Loss of funds due to user decisions</li>
                            <li>Payment processor failures</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">15. Dispute Resolution</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Disputes between lenders and borrowers must be resolved independently</li>
                            <li>Kuipid may provide limited support but is not obligated to intervene</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">16. Termination</h2>
                        <p className="leading-relaxed">We may suspend or terminate accounts that violate these Terms or engage in fraudulent or abusive behavior.</p>
                        <p className="leading-relaxed italic">Users may discontinue use at any time.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">17. Changes to Terms</h2>
                        <p className="leading-relaxed">We may update these Terms at any time. Continued use of the Platform constitutes acceptance of updated Terms.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">18. Governing Law</h2>
                        <p className="leading-relaxed font-bold">These Terms are governed by the laws of Nigeria.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-black text-main-green font-robotoSlab">19. Contact Information</h2>
                        <p className="leading-relaxed">For inquiries, contact: <br /><strong>Email: support@Kuipid.com</strong></p>
                    </section>
                </div>
            </div>
        </section>
    );
}
