"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    Building2,
    Shield,
    LogOut,
    ChevronRight,
    Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
    {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Requests",
        href: "/admin/requests",
        icon: FileText,
        badge: "14",
    },
    {
        label: "Borrowers",
        href: "/admin/borrowers",
        icon: Users,
    },
    {
        label: "Lenders",
        href: "/admin/lenders",
        icon: Building2,
    },
    {
        label: "Activity Log",
        href: "/admin/activity",
        icon: Activity,
    },
];

export function AdminNav() {
    const pathname = usePathname();

    const isActive = (item: (typeof navItems)[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    return (
        <aside className="w-64 fixed top-0 left-0 shrink-0 flex flex-col h-screen overflow-y-auto bg-[#1F4941] text-white">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-[#BDF49D] flex items-center justify-center">
                        <Shield size={18} className="text-[#1F4941]" />
                    </div>
                    <div>
                        <p className="font-black text-white text-sm">Kuipid</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Admin Console
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3 mb-3">
                    Navigation
                </p>
                {navItems.map((item) => {
                    const active = isActive(item);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-2xl font-bold text-sm transition-all group",
                                active
                                    ? "bg-[#BDF49D] text-[#1F4941]"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon
                                size={17}
                                className={cn(
                                    active
                                        ? "text-[#1F4941]"
                                        : "text-white/40 group-hover:text-white"
                                )}
                            />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <Badge className="bg-red-500/20 text-red-300 border-none text-[10px] font-black h-5 px-1.5">
                                    {item.badge}
                                </Badge>
                            )}
                            {active && (
                                <ChevronRight size={14} className="text-[#1F4941]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/10">
                <button className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-all">
                    <LogOut size={16} />
                    Back to Dashboard
                </button>
            </div>
        </aside>
    );
}
