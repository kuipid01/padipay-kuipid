"use client";
import {
    DashboardSidebar,
    DashboardHeader,
    SidebarProvider,
} from "@/components/dashboard/sidebar";
import { AccountDisabledWrapper } from "../../components/general/disabled";
import { Plans } from "../../components/landing/plans";
import { useState } from "react";
import { X } from "lucide-react";
import { FundingStatusChecker } from "@/components/dashboard/funding-status-checker";

export default function DashboardClientLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [upgradeModal, setUpgradeModal] = useState(false);

    return (
        <SidebarProvider>
            <FundingStatusChecker />
            <AccountDisabledWrapper>
                <div className="flex relative min-h-screen bg-white">
                    {/* Sidebar */}
                    <DashboardSidebar
                        upgradeModal={upgradeModal}
                        setUpgradeModal={setUpgradeModal}
                    />

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col min-w-0">
                        <DashboardHeader />

                        <div className="md:px-8 px-4 md:pb-8 pb-4">
                            <div className="bg-white min-h-[calc(100vh-140px)] ">
                                {children}
                            </div>
                        </div>
                    </main>
                    {upgradeModal && (
                        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto overscroll-contain">
                            <style
                                dangerouslySetInnerHTML={{
                                    __html: `body { overflow: hidden !important; }`,
                                }}
                            />

                            <div className="relative min-h-full py-20">
                                <Plans headerShown={false} />

                                <button
                                    onClick={() => setUpgradeModal(false)}
                                    className="fixed top-4 right-4 md:top-10 md:right-10 z-[110] p-2 hover:scale-110 transition-transform text-main-green"
                                >
                                    <X className="size-8 md:size-12" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </AccountDisabledWrapper>
        </SidebarProvider>
    );
}
