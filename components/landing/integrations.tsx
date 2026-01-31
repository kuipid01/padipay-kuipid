export function Integrations() {
    const partners = ["Paystack", "SmileID", "Mono", "Okra", "SendGrid", "Twilio"];

    return (
        <section className="py-24 border-y">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Integrations</h2>
                    <p className="text-2xl font-bold">Trusted by the best financial infrastructures</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((p, i) => (
                        <div key={i} className="text-2xl font-black tracking-tighter hover:text-primary transition-colors cursor-default">
                            {p}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
