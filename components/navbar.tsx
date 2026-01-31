"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                scrolled ? "bg-background/80 backdrop-blur-md border-border py-3" : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                    PadiLoan
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                    <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it works</Link>
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                    <Button asChild>
                        <Link href="/register">Get Started</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
