import { Plans } from "@/components/landing/plans";

export default function PricingPage() {
    return (
        <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-12 text-center">Transparent Pricing</h1>
            <Plans />
        </div>
    );
}
