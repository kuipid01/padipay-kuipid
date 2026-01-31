import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import BentoDesign from "../general/bento-grid";

export function HeroSection() {
    return (
        <section className="relative bg-linear-to-b from-white to-lemon-primary/30 pt-32 _pb-20 md:pt-48 md:_pb-32 overflow-hidden">


            <div className="container relative mx-auto font-robotoSlab px-4 text-center">
                <BentoDesign />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl z-10 relative md:text-7xl font-extrabold tracking-tight mb-6  text-main-green">
                        Your Loan Infrastructure <br className="hidden md:block" /> Simplified.
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <p className="text-lg z-10 relative md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium">
                        The bridge between lenders and borrowers. Automated repayments, reminders, and verification — all in one place.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col z-10 relative sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button size="lg" className="h-12 px-8 text-black font-medium text-md" asChild>
                        <Link href="/register">
                            Start Lending <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 shadow shadow-gray-300 px-8 font-medium text-black text-md" asChild>
                        <Link href="/login">Manage Dashboard</Link>
                    </Button>
                </motion.div>
            </div>

            <Image src="/dashy.jpg" alt="Hero Image" width={1200} height={1024} className="w-[1200px] translate-y-20 mt-auto relative mx-auto h-auto" />
        </section>
    );
}
