import { Faq } from "@/components/landing/faq";

export default function FaqPage() {
    return (
        <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-black text-main-green mb-12 text-center">Frequently Asked Questions</h1>
            <Faq />
        </div>
    );
}
