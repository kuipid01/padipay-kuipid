"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ButtonPrimary from "./general/button";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function NavBar() {
    const router = useRouter()

    const [scrolled, setScrolled] = useState(false);
    const [hash, setHash] = useState("");
    const [isOpen, setIsOpen] = useState(false);

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
        active: "bg-lemon-primary/50 font-medium text-black px-4 py-3 rounded md:px-3 md:py-2",
        default: "text-gray-700 px-4 py-3 rounded md:px-3 md:py-2 hover:text-primary transition-colors",
    };

    const navLinks = [
        { name: "Features", href: "/#features" },
        { name: "How it works", href: "/#how-it-works" },
        { name: "Pricing", href: "/#pricing" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-[20px] border shadow shadow-gray-300 border-gray-300",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-border py-2"
                    : "bg-white/50 backdrop-blur-sm py-2",
                "w-[95%] md:w-[85%] lg:w-3/4"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                <Link
                    href="/"
                    className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent"
                >
                    <Image src="/logo.svg" alt="Logo" width={50} height={50} />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 lg:gap-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            onClick={() => setHash(link.href)}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium",
                                hash === link.href ? LinksCN.active : LinksCN.default
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:block">
                        <ButtonPrimary onClick={() => router.push("/register")} text="Get Started" href="/register" />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[20px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col p-4 gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                onClick={() => {
                                    setHash(link.href);
                                    setIsOpen(false);
                                }}
                                href={link.href}
                                className={cn(
                                    "text-base font-medium",
                                    hash === link.href ? LinksCN.active : LinksCN.default
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="sm:hidden pt-2 border-t border-gray-100">
                            <ButtonPrimary text="Get Started" href="/register" className="w-full justify-center" />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
