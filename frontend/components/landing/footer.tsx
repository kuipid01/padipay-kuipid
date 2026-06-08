"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Facebook, Instagram, Linkedin, Youtube, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingFooter() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <footer className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    {/* Left Brand Column */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="size-8 bg-main-green rounded-lg flex items-center justify-center">
                                <span className="text-lemon-primary font-black text-xl">P</span>
                            </div>
                            <span className="text-2xl font-black text-main-green tracking-tight font-robotoSlab">Kuipid</span>
                        </Link>

                        <p className="text-gray-500 text-md font-medium leading-relaxed max-w-sm">
                            The industrial-grade bridge between lenders and borrowers. Providing the infrastructure to launch, manage, and scale your lending operations with ease.
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-main-green uppercase tracking-wider">Join our newsletter</h4>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const formData = new FormData(form);
                                    const email = formData.get("email") as string;

                                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                        toast.error("Please enter a valid email address.");
                                        return;
                                    }

                                    setIsSubmitting(true);
                                    try {
                                        const res = await fetch("/api/newsletter", {
                                            method: "POST",
                                            body: JSON.stringify({ email }),
                                        });
                                        if (res.ok) {
                                            toast.success("Subscribed successfully!");
                                            form.reset();
                                        } else {
                                            toast.error("Failed to subscribe. Please try again.");
                                        }
                                    } catch (err) {
                                        toast.error("An error occurred. Please try again later.");
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                className="flex gap-2 max-w-md"
                            >
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="h-12 bg-gray-50 border-gray-100 rounded-xl focus-visible:ring-main-green font-medium"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isSubmitting}
                                    className="h-12 w-12 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-xl shadow-lg shadow-lemon-primary/20 shrink-0"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Right Links Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 lg:gap-8">

                        <FooterColumn
                            title="Platform"
                            links={[
                                { label: "Features", href: "/#features" },
                                { label: "Pricing", href: "/#pricing" }
                            ]}
                        />
                        <FooterColumn
                            title="Support"
                            links={[
                                { label: "FAQ", href: "/faq" },
                                { label: "Contact Us", href: "/contact" }
                            ]}
                        />

                        <FooterColumn
                            title="Legal"
                            links={[
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                            ]}
                        />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm font-bold">
                        2026 Kuipid. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        <SocialIcon href="https://facebook.com/Kuipid" icon={<Facebook size={18} />} />
                        <SocialIcon href="https://instagram.com/Kuipid" icon={<Instagram size={18} />} />
                        <SocialIcon href="https://linkedin.com/company/Kuipid" icon={<Linkedin size={18} />} />
                        <SocialIcon href="https://youtube.com/@Kuipid" icon={<Youtube size={18} />} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div className="space-y-6">
            <h4 className="text-xs font-black text-main-green uppercase tracking-[0.2em]">{title}</h4>
            <ul className="space-y-4">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} className="text-gray-500 hover:text-main-green text-[13px] font-bold transition-all duration-300 hover:translate-x-1 inline-block">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <Link href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-lemon-primary/40 text-main-green flex items-center justify-center hover:bg-lemon-primary transition-all duration-300">
            {icon}
        </Link>
    );
}
