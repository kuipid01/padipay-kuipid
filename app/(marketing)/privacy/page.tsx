export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-8">Privacy Policy</h1>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
                <p>Last updated: February 1, 2026</p>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, apply for a loan, or communicate with us.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">2. How We Use Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, and to protect the safety and security of our users.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-main-green">3. Data Security</h2>
                    <p>We implement industry-standard security measures to protect your personal information.</p>
                </section>
            </div>
        </div>
    );
}
