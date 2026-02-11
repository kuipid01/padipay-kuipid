"use client";

import {
    LayoutDashboard,
    History,
    Settings,
    HelpCircle,
    LogOut,
    Bell,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    User2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, createContext, useContext } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUser } from "@/hooks/use-user";

const borrowerNavLinks = [
    { href: "/borrower/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/borrower/dashboard/history", icon: History, label: "Loan History" },
    { href: "/borrower/dashboard/settings", icon: Settings, label: "Settings" },
    { href: "/borrower/dashboard/help", icon: HelpCircle, label: "Help & Support" },
];

type SidebarContextType = {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
    return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse: () => setIsCollapsed(!isCollapsed) }}>
            {children}
        </SidebarContext.Provider>
    );
}

function SidebarContent({ isCollapsed }: { isCollapsed: boolean }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="flex flex-col h-full gap-4">
            <div className={cn("bg-[#FAFAFA] rounded-[32px] p-4 shadow-sm flex flex-col gap-1", isCollapsed && "items-center px-2")}>
                {borrowerNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group relative",
                                isActive ? "bg-lemon-primary text-black shadow-lg" : "text-gray-600 hover:text-lemon-primary hover:bg-gray-50",
                                isCollapsed && "px-2 justify-center w-full"
                            )}
                        >
                            <link.icon size={20} className={cn("shrink-0", isActive ? "text-black" : "text-gray-600 group-hover:text-lemon-primary")} />
                            {!isCollapsed && <span className="relative z-10 whitespace-nowrap">{link.label}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className={cn("mt-auto bg-[#FAFAFA] rounded-[32px] p-4 shadow-sm", isCollapsed && "flex justify-center")}>
                <button
                    onClick={() => router.push("/api/auth/logout")}
                    className="flex gap-3 items-center font-bold text-sm text-red-600 hover:text-red-700 w-full px-4 py-2"
                >
                    <LogOut size={20} />
                    {!isCollapsed && "Logout"}
                </button>
            </div>
        </div>
    );
}

export function BorrowerSidebar() {
    const { isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse } = useSidebar();

    return (
        <>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-4 w-[280px] bg-white border-none">
                    <SidebarContent isCollapsed={false} />
                </SheetContent>
            </Sheet>

            <aside className={cn("hidden md:flex flex-col sticky top-0 h-screen p-4 gap-4 transition-all duration-300", isCollapsed ? "w-[100px]" : "w-[280px]")}>
                <div className="flex justify-start">
                    <Button variant="ghost" size="icon" onClick={toggleCollapse} className="text-gray-500 hover:text-black">
                        {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                    </Button>
                </div>
                <SidebarContent isCollapsed={isCollapsed} />
            </aside>
        </>
    );
}

export function BorrowerHeader() {
    const { user } = useUser();
    const { setIsMobileOpen } = useSidebar();

    return (
        <header className="h-20 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
                <Menu className="h-6 w-6" />
            </Button>

            <div className="text-xl font-black text-main-green md:block hidden">
                Borrower Portal
            </div>

            <div className="flex items-center gap-4">
                <Button size="icon" variant="ghost" className="rounded-xl text-gray-400">
                    <Bell size={20} />
                </Button>
                <div className="flex items-center gap-2 bg-white rounded-2xl p-1 px-2 shadow-sm border border-gray-100">
                    <Avatar className="size-10 rounded-full border-2 border-primary/10">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback><User2 /></AvatarFallback>
                    </Avatar>
                    <div className="md:flex flex-col hidden text-left">
                        <p className="font-bold text-sm leading-none">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-400">Borrower</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
