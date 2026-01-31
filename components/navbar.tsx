"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ButtonPrimary from "./general/button";

export function NavBar() {
    const [scrolled, setScrolled] = useState(false);
    const [hash, setHash] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        const updateHash = () => {
            setHash(globalThis.location.hash);
        };

        updateHash();

        window.addEventListener("scroll", handleScroll);
        globalThis.addEventListener("hashchange", updateHash);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            globalThis.removeEventListener("hashchange", updateHash);
        };
    }, []);

    const LinksCN = {
        active: "bg-lemon-primary/20 font-medium text-black px-4 py-3 rounded",
        default: "text-gray-700 px-4 py-3 rounded",
    };

    return (
        <nav
            className={cn(
                "fixed top-5 w-3/4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-[20px] border shadow shadow-gray-300 border-gray-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-border py-2"
                    : "bg-transparent py-2"
            )}
        >
            <div className="container mx-auto px-5 flex justify-between items-center">
                <Link
                    href="/"
                    className="text-2xl font-bold bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent"
                >
                    PadiLoan
                </Link>

                <div className="hidden md:flex items-center gap-3">
                    <Link
                        onClick={() => setHash("#features")}
                        href="#features"
                        className={cn(
                            hash === "#features" ? LinksCN.active : LinksCN.default,
                            "text-sm font-medium hover:text-primary transition-colors"
                        )}
                    >
                        Features
                    </Link>

                    <Link
                        onClick={() => setHash("#how-it-works")}
                        href="#how-it-works"
                        className={cn(
                            hash === "#how-it-works" ? LinksCN.active : LinksCN.default,
                            "text-sm font-medium hover:text-primary transition-colors"
                        )}
                    >
                        How it works
                    </Link>
                    <Link
                        onClick={() => setHash("#pricing")}
                        href="#pricing"
                        className={cn(
                            hash === "#pricing" ? LinksCN.active : LinksCN.default,
                            "text-sm font-medium hover:text-primary transition-colors"
                        )}
                    >
                        Pricing
                    </Link>


                </div>

                <ButtonPrimary text="Get Started" href="/register" />
            </div>
        </nav>
    );
}
