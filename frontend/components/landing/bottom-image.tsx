"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LandingBadge } from "../general/landing-badge";

export function BottomImage() {
    return (
        <section className="flex justify-center items-center bg-[#f1f6ed] h-fit py-10 md:py-0  md:min-h-[80vh] ">
            <div className="container max-w-6xl mx-auto px-4">
                <div className="rounded-[40px] bg-main-green relative p-8 md:p-16  w-full overflow-hidden h-[350px] flex items-center">
                    <img src="/bg-sec-1.png" alt="bg-sec" className="inset-0  absolute h-full w-full object-cover object-center" />
                    <div className="absolute inset-0 h-full w-full object-cover object-center bg-black/30"></div>
                    <div className="grid items-center w-full relative z-10">
                        {/* Left Content */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex  items-center gap-1 md:gap-2 px-5 md:px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                                <div className="size-1.5 rounded-full bg-lemon-primary" />
                                <span className=" text-sm md:text-lg font-bold md:font-black md:tracking-wider text-white uppercase flex items-center gap-2">
                                    <span className="bg-white text-nowrap text-main-green px-1.5 py-0.5 rounded-sm">Padi</span>
                                    Smarter Loan Management
                                </span>
                            </div>


                            <p className="text-white/90 text-lg md:text-xl font-medium ">
                                Join thousands of users managing smarter with MyCashNG.
                            </p>
                            <div className="pt-4 flex justify-center">
                                <Button size="lg" className="h-14 px-10 text-lg font-black bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl shadow-xl shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                    <Link href="/register">Create Free Account</Link>
                                </Button>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </section >
    );
}
