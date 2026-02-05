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

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [upgradeModal, setUpgradeModal] = useState(false);

  return (
    <SidebarProvider>
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
            <>
              <div className="fixed inset-0 z-100 bg-white overflow-y-auto">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `body { overflow: hidden; }`,
                  }}
                />
                
                <Plans headerShown={false} />
              </div>
              <button
                  onClick={() => {
                    setUpgradeModal(false);
                  }}
                  className=" fixed translate-y-10 top-2 md:top-5 z-150 right-5 md:right-10"
                >
                       <X
                size={60}
                className="md:hover:size-13 hover:size-6 cursor-pointer transition-all duration-300 text-main-green size-8 md:size-15"
              />{" "}
                </button>
         
            </>
          )}
        </div>
      </AccountDisabledWrapper>
    </SidebarProvider>
  );
}
