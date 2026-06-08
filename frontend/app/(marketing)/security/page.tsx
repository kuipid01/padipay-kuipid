import { ShieldCheck, Lock, EyeOff, Server } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-8">Security at Kuipid</h1>
            <p className="text-xl text-gray-500 mb-12">
                Your data security and privacy are our top priorities. We use industry-leading practices to keep your information safe.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
                <SecurityFeature
                    icon={<ShieldCheck className="text-main-green" size={32} />}
                    title="Data Encryption"
                    description="All sensitive data is encrypted at rest and in transit using advanced AES-256 encryption."
                />
                <SecurityFeature
                    icon={<Lock className="text-main-green" size={32} />}
                    title="Two-Factor Auth"
                    description="Secure your account with 2FA to prevent unauthorized access."
                />
                <SecurityFeature
                    icon={<EyeOff className="text-main-green" size={32} />}
                    title="Privacy First"
                    description="We never share your personal information with third parties without your explicit consent."
                />
                <SecurityFeature
                    icon={<Server className="text-main-green" size={32} />}
                    title="Secure Infrastructure"
                    description="Our servers are hosted in secure, world-class data centers with 24/7 monitoring."
                />
            </div>
        </div>
    );
}

function SecurityFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-main-green mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
    );
}
