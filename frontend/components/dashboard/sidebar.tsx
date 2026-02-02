"use client";

import { LayoutDashboard, Users, TrendingUp, FileText, Folder, Calendar, Building2, Settings, Plus, LogOut, Bell, MoreHorizontal, Rocket, User2, CreditCard, HandCoins, Search, Command, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef, createContext, useContext } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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

// Context for Sidebar State
type SidebarContextType = {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse: toggleCollapse }}>
            {children}
        </SidebarContext.Provider>
    );
}

function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Navigation Menu */}
            <div className={cn(
                "_flex-1 bg-[#FAFAFA] rounded-[32px] p-4 shadow-sm h-fit flex flex-col gap-1 overflow-y-auto scrollbar-hide transition-all duration-300",
                isCollapsed && "items-center px-2"
            )}>
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            title={isCollapsed ? link.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group relative",
                                isActive
                                    ? "bg-lemon-primary text-black shadow-lg shadow-blue-500/25"
                                    : "text-gray-600 hover:text-lemon-primary hover:bg-gray-50",
                                isCollapsed && "px-2 justify-center w-full"
                            )}
                        >
                            <link.icon size={20} className={cn(
                                "transition-colors shrink-0",
                                isActive ? "text-black" : "text-gray-600 group-hover:text-lemon-primary"
                            )} />
                            {!isCollapsed && <span className="relative z-10 whitespace-nowrap">{link.label}</span>}
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
            {!isCollapsed && (
                <div className="relative my-3 bg-lemon-primary rounded-[32px] p-6 shadow-xl shadow-blue-500/20 overflow-hidden group">
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
            )}
            {isCollapsed && (
                <div className="flex justify-center my-3">
                    <div className="size-10 bg-lemon-primary rounded-xl flex items-center justify-center cursor-pointer shadow-lg" title="Upgrade for additional features">
                        <Rocket size={20} className="text-black fill-white" />
                    </div>
                </div>
            )}


            <div className={cn("mt-auto bg-[#FAFAFA] rounded-[32px] p-4 shadow-sm", isCollapsed && "flex justify-center")}>
                <button className="flex gap-1 items-center font-bold text-sm text-gray-700">
                    <LogOut color="red" size={isCollapsed ? 24 : 20} />
                    {!isCollapsed && "Logout"}
                </button>
            </div>
        </div>
    );
}

export function DashboardSidebar({ session }: Readonly<DashboardSidebarProps>) {
    const { isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse } = useSidebar();

    return (
        <>
            {/* Mobile Sheet */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-4 w-[280px] bg-white border-none">
                    <SidebarContent isCollapsed={false} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col justify-between sticky top-0 h-screen p-4 gap-4 transition-all duration-300",
                isCollapsed ? "w-[100px]" : "w-[280px]"
            )}>
                {/* Collapse Toggle */}
                <div className="flex justify-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCollapse}
                        className="text-gray-500 hover:text-black"
                    >
                        {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                    </Button>
                </div>

                <SidebarContent isCollapsed={isCollapsed} />
            </aside>
        </>
    );
}

export function DashboardHeader() {
    const { setIsMobileOpen } = useSidebar();
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
        <header className="h-20 bg-white px-4 md:px-8 flex gap-4 md:gap-10 items-center justify-between sticky top-0 z-40">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex-1 _max-w-md relative" ref={searchRef}>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        ref={inputRef}
                        placeholder="Search dashboard..."
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-100 rounded-2xl focus-visible:ring-main-green focus-visible:bg-white transition-all font-bold placeholder:text-gray-400 placeholder:font-medium w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 md:flex hidden items-center gap-1 bg-white border border-gray-200 px-1.5 py-1 rounded-md shadow-sm pointer-events-none">
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
                            className="md:absolute fixed w-[95%] mx-auto top-[10vh] md:top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-gray-100 shadow-2xl p-2 z-50 overflow-hidden"
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

            <div className="flex items-center gap-1 md:gap-4 shrink-0">
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm ">
                    <Button size="icon" variant="ghost" className="rounded-xl text-gray-400"><Bell size={20} /></Button>
                </div>

                <div className="flex items-center gap-1 bg-white rounded-2xl md:p-1 md:px-2 shadow-md">
                    <Avatar className="size-10 md:size-12 rounded-full border-2 border-primary/10">
                        <AvatarImage src={`/register-illustration.png`} />
                        <AvatarFallback><User2 /></AvatarFallback>
                    </Avatar>
                    <div className="md:flex flex-col hidden gap-1">
                        <p className="font-bold">Aderie John</p>
                        <p className="text-xs text-gray-400">aderiejohn@gmail.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
