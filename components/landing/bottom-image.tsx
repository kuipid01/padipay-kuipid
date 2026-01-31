import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BottomImage() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4">
                <div className="rounded-[40px] bg-linear-to-br from-primary to-violet-600 p-12 md:p-24 text-center overflow-hidden relative group">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                            Ready to professionalize your lending business?
                        </h2>
                        <p className="text-white/80 text-xl font-medium">
                            Join hundreds of lenders who have automated their loan infrastructure with PadiLoan.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold shadow-xl shadow-black/20" asChild>
                                <Link href="/register">Create Your Account</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold text-white border-white/30 hover:bg-white/10" asChild>
                                <Link href="/" className="flex items-center gap-2">Contact Sales <ArrowRight size={20} /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
