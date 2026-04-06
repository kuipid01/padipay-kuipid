"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LandingBadge } from "../general/landing-badge";

export function BottomImage() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="rounded-[40px] bg-main-green p-8 md:p-16 overflow-hidden relative min-h-[500px] flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full relative z-10">
                        {/* Left Content */}
                        <div className="text-left space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                                <div className="size-1.5 rounded-full bg-lemon-primary" />
                                <span className="text-[10px] font-black tracking-wider text-white uppercase flex items-center gap-2">
                                    <span className="bg-white text-main-green px-1.5 py-0.5 rounded-sm">Padi</span>
                                    Smarter Loan Management
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                                Ready To Take Charge <br /> Of Your Finances?
                            </h2>
                            <p className="text-white/70 text-lg md:text-xl font-medium max-w-lg">
                                Join thousands of users managing smarter with MyCashNG.
                            </p>
                            <div className="pt-4">
                                <Button size="lg" className="h-14 px-10 text-lg font-black bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-2xl shadow-xl shadow-black/10 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                    <Link href="/register">Create Free Account</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Right Content - Mockup Dashboard */}
                        <div className="hidden lg:block relative">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h4 className="text-gray-900 font-black text-xl mb-1">Cashflow</h4>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Balance</p>
                                        <p className="text-3xl font-black text-main-green mt-1">$12,000</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-right shadow-sm">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Income</p>
                                        <p className="text-md font-black text-main-green">$6,000</p>
                                        <p className="text-[8px] text-gray-400 font-bold">Tuesday, 6 June 2026</p>
                                    </div>
                                </div>

                                {/* Simplified Graph */}
                                <div className="h-48 w-full relative flex items-end gap-1">
                                    <svg className="w-full h-full" viewBox="0 0 400 150">
                                        {/* Grid lines */}
                                        <line x1="0" y1="0" x2="400" y2="0" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="0" y1="75" x2="400" y2="75" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="0" y1="112.5" x2="400" y2="112.5" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="0" y1="150" x2="400" y2="150" stroke="#f3f4f6" strokeWidth="1" />

                                        {/* Wave Path 1 */}
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            d="M0,120 C50,130 150,50 200,90 C250,130 350,70 400,80"
                                            fill="none"
                                            stroke="#1F4941"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                        {/* Wave Path 2 (Lighter) */}
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                                            d="M0,100 C80,110 180,30 230,70 C280,110 320,40 400,60"
                                            fill="none"
                                            stroke="#BDF49D"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                        {/* Point and label */}
                                        <circle cx="230" cy="70" r="4" fill="#BDF49D" />
                                        <line x1="230" y1="70" x2="230" y2="150" stroke="#BDF49D" strokeDasharray="4 2" />
                                    </svg>

                                    <div className="absolute inset-x-0 bottom-[-20px] flex justify-between px-2 text-[10px] font-black text-gray-400">
                                        <span>Sun</span>
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
