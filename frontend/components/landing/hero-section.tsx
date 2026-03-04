import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import BentoDesign from "../general/bento-grid";
import { LandingBadge } from "../general/landing-badge";

export function HeroSection() {
    return (
        <section className="relative bg-linear-to-b from-white to-lemon-primary/30 pt-28 pb-10 md:pt-48 md:pb-32 overflow-hidden">
            <div className="container relative mx-auto font-robotoSlab px-4 text-center">
                <BentoDesign />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <LandingBadge label="PadiLoan" text="Smarter Money Management" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl z-10 relative font-extrabold tracking-tight mb-6 text-main-green leading-[1.1]">
                        Lending Infrastructure <br className="hidden md:block" /> Reimagined.
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <p className="text-base sm:text-lg md:text-xl z-10 relative text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 font-medium px-4">
                        The bridge between lenders and borrowers. Automated repayments, reminders, and verification — all in one place.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col z-10 relative sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-black font-medium text-md" asChild>
                        <Link href="/register">
                            Start Lending <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto shadow shadow-gray-300 px-8 font-medium text-black text-md" asChild>
                        <Link href="/login">Manage Dashboard</Link>
                    </Button>
                </motion.div>
            </div>

            <div className="relative mt-12 md:mt-24 px-4 overflow-visible">
                <Image
                    src="/pay.png"
                    alt="Hero Image"
                    width={1200}
                    height={1024}
                    className="w-full max-w-5xl max-h-screen object-top object-cover mx-auto rounded-t-3xl shadow-2xl border border-gray-200 transform translate-y-10 md:translate-y-20"
                    priority
                />
            </div>
        </section>
    );
}
