import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <DashboardSidebar session={session} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <DashboardHeader />

                <div className="px-8 pb-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm min-h-[calc(100vh-140px)] p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
