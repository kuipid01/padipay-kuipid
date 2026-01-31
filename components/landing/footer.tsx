import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingFooter() {
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
                            <span className="text-2xl font-black text-main-green tracking-tight">Padi-Loan</span>
                        </Link>

                        <p className="text-gray-500 text-md font-medium leading-relaxed max-w-md">
                            We are passionate about helping businesses leverage the power of technology to achieve their goals.
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-main-green uppercase tracking-wider">Join our newsletter</h4>
                            <div className="flex gap-2 max-w-md">
                                <Input
                                    placeholder="Enter your email"
                                    className="h-12 bg-gray-50 border-gray-100 rounded-xl focus-visible:ring-main-green font-medium"
                                />
                                <Button size="icon" className="h-12 w-12 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 rounded-xl shadow-lg shadow-lemon-primary/20 shrink-0">
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Links Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <FooterColumn
                            title="Company"
                            links={[
                                { label: "About us", href: "/" },
                                { label: "Careers", href: "/" },
                                { label: "Blog", href: "/" },
                                { label: "Press", href: "/" }
                            ]}
                        />
                        <FooterColumn
                            title="Product"
                            links={[
                                { label: "Dashboard", href: "/" },
                                { label: "Integrations", href: "/" },
                                { label: "Pricing", href: "/" },
                                { label: "Security", href: "/" }
                            ]}
                        />
                        <FooterColumn
                            title="Support"
                            links={[
                                { label: "Help Center", href: "/" },
                                { label: "FAQ", href: "/" },
                                { label: "Contact", href: "/" }
                            ]}
                        />
                        <FooterColumn
                            title="Legal"
                            links={[
                                { label: "Privacy Policy", href: "/" },
                                { label: "Terms of Service", href: "/" },
                                { label: "Term & Conditions", href: "/" },
                                { label: "License", href: "/" }
                            ]}
                        />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm font-bold">
                        2026 Padi-Loan. All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        <SocialIcon icon={<Facebook size={18} />} />
                        <SocialIcon icon={<Instagram size={18} />} />
                        <SocialIcon icon={<Linkedin size={18} />} />
                        <SocialIcon icon={<Youtube size={18} />} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div className="space-y-6">
            <h4 className="text-sm font-black text-main-green uppercase tracking-wider">{title}</h4>
            <ul className="space-y-4">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} className="text-gray-500 hover:text-main-green text-sm font-bold transition-colors">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <Link href="/" className="w-10 h-10 rounded-full bg-lemon-primary/40 text-main-green flex items-center justify-center hover:bg-lemon-primary transition-all duration-300">
            {icon}
        </Link>
    );
}
