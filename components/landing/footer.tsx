import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="py-20 border-t bg-card">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6 flex flex-col items-start">
                        <Link href="/" className="text-2xl font-bold bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                            PadiLoan
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            The ultimate infrastructure for peer-to-peer and micro-finance lenders. Automated, secure, and transparent.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                            <SocialIcon icon={<Linkedin size={18} />} />
                            <SocialIcon icon={<Github size={18} />} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Product</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Integrations</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Repayment Auto-pilot</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Verification APIs</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Company</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Case Studies</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Resources</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Lending Best Practices</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Developer Portal</Link></li>
                            <li><Link href="/" className="hover:text-primary transition-colors">Support Center</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
                    <p>© {new Date().getFullYear()} PadiLoan Labs. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/" className="hover:text-foreground">Cookies</Link>
                        <Link href="/" className="hover:text-foreground">Security</Link>
                        <Link href="/" className="hover:text-foreground">Status</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
    return (
        <Link href="/" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300">
            {icon}
        </Link>
    );
}
