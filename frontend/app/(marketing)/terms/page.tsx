export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-8">Terms of Service</h1>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
                <p>Last updated: February 1, 2026</p>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">1. Acceptance of Terms</h2>
                    <p>By accessing or using MyCashNG, you agree to be bound by these Terms of Service.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">2. Use of Services</h2>
                    <p>You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">3. Account Responsibility</h2>
                    <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                </section>
            </div>
        </div>
    );
}
