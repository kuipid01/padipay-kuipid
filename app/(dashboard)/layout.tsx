import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LayoutDashboard, CreditCard, Users, Settings, Plus, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6">
                    <Link href="/dashboard" className="text-xl font-bold bg-linear-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                        PadiLoan
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <SidebarLink href="/dashboard/apps" icon={<CreditCard size={20} />} label="Loan Apps" />
                    <SidebarLink href="/dashboard/applications" icon={<Users size={20} />} label="Applications" />
                    <SidebarLink href="/dashboard/loans" icon={<Users size={20} />} label="Active Loans" />
                    <SidebarLink href="/dashboard/notifications" icon={<Bell size={20} />} label="Notifications" />
                    <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" asChild>
                        <Link href="/api/auth/logout">
                            <LogOut size={20} className="mr-2" /> Logout
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="font-semibold text-lg">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Button size="sm" asChild>
                            <Link href="/dashboard/apps/new">
                                <Plus size={18} className="mr-1" /> New App
                            </Link>
                        </Button>
                    </div>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, active = false }: Readonly<{ href: string, icon: React.ReactNode, label: string, active?: boolean }>) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
