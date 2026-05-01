"use client";

import React from 'react';
import { ShieldAlert, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from 'next/link';

export const UserOwnsLoanUI = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-blue-100 rounded-[32px] rotate-6 animate-pulse" />
                    <div className="absolute inset-0 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <ShieldAlert size={44} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        This application is yours
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                        You are the owner of this loan application. To maintain security, 
                        please manage your applications directly from your personal dashboard.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2">
                            <LayoutDashboard size={18} />
                            Go to Dashboard
                            <ArrowRight size={18} />
                        </Button>
                    </Link>
                    <Link href="/" className="w-full">
                        <Button variant="ghost" className="w-full h-14 rounded-2xl text-gray-600 font-medium hover:bg-gray-100 transition-all">
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="pt-8">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                        Padipay Security Protocol
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
