import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardSidebar, DashboardHeader, SidebarProvider } from "@/components/dashboard/sidebar";
import { AccountDisabledWrapper } from "../../components/general/disabled";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <SidebarProvider>
            <AccountDisabledWrapper >
                <div className="flex min-h-screen bg-white">
                    {/* Sidebar */}
                    <DashboardSidebar session={session} />

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col min-w-0">
                        <DashboardHeader />

                        <div className="md:px-8 px-4 md:pb-8 pb-4">
                            <div className="bg-white min-h-[calc(100vh-140px)] ">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </AccountDisabledWrapper>
        </SidebarProvider>
    );
}