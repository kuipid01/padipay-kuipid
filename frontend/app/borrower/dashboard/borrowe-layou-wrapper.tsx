"use client";

import {
    BorrowerSidebar,
    BorrowerHeader,
    SidebarProvider,
} from "@/components/borrower/sidebar";

export default function BorrowerClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex relative min-h-screen bg-white">
                <BorrowerSidebar />
                <main className="flex-1 flex flex-col min-w-0">
                    <BorrowerHeader />
                    <div className="md:px-8 px-4 md:pb-8 pb-4">
                        <div className="bg-white min-h-[calc(100vh-140px)]">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>

    );
}



