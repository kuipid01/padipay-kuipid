"use client";

import { LayoutDashboard, Users, TrendingUp, FileText, Folder, Calendar, Building2, Settings, Plus, LogOut, Bell, MoreHorizontal, Rocket, User2, CreditCard, HandCoins, Search, Command } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";

interface DashboardSidebarProps {
    session: any;
}

const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/apps", icon: CreditCard, label: "Loan Apps" },
    { href: "/dashboard/applications", icon: Users, label: "Applications" },
    { href: "/dashboard/loans", icon: HandCoins, label: "Active Loans" },
    { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar({ session }: Readonly<DashboardSidebarProps>) {
    const pathname = usePathname();

    return (
        <aside className="w-[280px] hidden md:flex flex-col sticky top-0 h-screen p-4 gap-4">
            {/* User Profile Card */}
            <div className="bg-[#FAFAFA] rounded-[32px] p-6 shadow-sm  flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                    <Avatar className="size-12 rounded-full border-2 border-primary/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.fullName || 'User'}`} />
                        <AvatarFallback><User2 /></AvatarFallback>
                    </Avatar>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-bold text-black/80">
                        {format(new Date(), "EEEE, MMMM d")}
                    </p>
                    <h2 className="text-lg font-black text-black leading-tight">
                        Welcome back, <br />
                        <span className="text-black">{session?.fullName?.split(' ')[0] || 'User'}!</span>
                    </h2>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 bg-[#FAFAFA] rounded-[32px] p-4 shadow-sm  flex flex-col gap-1 overflow-y-auto scrollbar-hide">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group relative",
                                isActive
                                    ? "bg-lemon-primary text-black shadow-lg shadow-blue-500/25"
                                    : "text-gray-600 hover:text-lemon-primary hover:bg-gray-50"
                            )}
                        >
                            <link.icon size={20} className={cn(
                                "transition-colors",
                                isActive ? "text-black" : "text-gray-600 group-hover:text-lemon-primary"
                            )} />
                            <span className="relative z-10">{link.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar"
                                    className="absolute inset-0 bg-lemon-primary rounded-2xl z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Upgrade CTA Card */}
            <div className="relative bg-lemon-primary rounded-[32px] p-6 shadow-xl shadow-blue-500/20 overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 size-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />

                <div className="relative z-10 space-y-4">
                    <div className="flex gap-3">
                        <div className="size-10 rounded-xl flex items-center justify-center">
                            <Rocket size={20} className="text-black fill-white" />
                        </div>

                        <p className="text-sm font-bold text-black leading-snug">
                            Upgrade for additional features.
                        </p>
                    </div>


                    <Button className="w-fit bg-main-green text-white hover:bg-main-green/90 rounded-xl font-black h-10 shadow-lg transition-transform active:scale-95">
                        Upgrade
                    </Button>
                </div>
            </div>
        </aside>
    );
}

export function DashboardHeader() {
    const [isFocused, setIsFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsFocused(false);
                inputRef.current?.blur();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            globalThis.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredLinks = navLinks.filter(link =>
        link.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <header className="h-20 bg-white px-8 flex gap-10 items-center justify-between sticky top-0 z-50">
            <div className="flex-1 _max-w-md relative" ref={searchRef}>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        ref={inputRef}
                        placeholder="Search dashboard..."
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-100 rounded-2xl focus-visible:ring-main-green focus-visible:bg-white transition-all font-bold placeholder:text-gray-400 placeholder:font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-gray-200 px-1.5 py-1 rounded-md shadow-sm pointer-events-none">
                        <Command size={10} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400">K</span>
                    </div>
                </div>

                <AnimatePresence>
                    {isFocused && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-gray-100 shadow-2xl p-2 z-50 overflow-hidden"
                        >
                            <div className="p-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Quick Links</p>
                                <div className="space-y-1">
                                    {filteredLinks.length > 0 ? (
                                        filteredLinks.map((link) => (
                                            <button
                                                key={link.href}
                                                onClick={() => {
                                                    router.push(link.href);
                                                    setIsFocused(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-lemon-primary/10 text-sm font-bold text-gray-600 hover:text-main-green transition-all text-left group"
                                            >
                                                <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-lemon-primary transition-colors">
                                                    <link.icon size={16} className="text-gray-400 group-hover:text-main-green" />
                                                </div>
                                                {link.label}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="p-4 text-sm text-gray-400 text-center font-medium italic">No results found for "{searchQuery}"</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center bg-white shadow shadow-gray-400 rounded-2xl px-5 py-2 gap-4">
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm ">
                    <Button size="icon" variant="ghost" className="rounded-xl text-gray-400"><Bell size={20} /></Button>
                </div>
                <Button className="rounded-2xl h-11 bg-lemon-primary text-main-green font-black hover:bg-lemon-primary/90 shadow-lg shadow-lemon-primary/10 transition-transform active:scale-95" asChild>
                    <Link href="/dashboard/apps/new">
                        <Plus size={18} className="mr-1 stroke-3" /> New Application
                    </Link>
                </Button>

                <Button variant="ghost" className="size-11 rounded-2xl text-gray-400 hover:text-destructive p-0" asChild>
                    <Link href="/api/auth/logout">
                        <LogOut size={20} />
                    </Link>
                </Button>
            </div>
        </header>
    );
}
