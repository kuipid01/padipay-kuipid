import { ReactNode } from "react";
import { AdminNav } from "@/components/admin/nav";

export const metadata = {
  title: "Admin — Kuipid",
  description: "Internal-only admin dashboard",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F7F2]">
      <AdminNav />
      <main className="flex-1 flex flex-col min-w-0 min-h-screen pl-64 overflow-auto">
        {children}
      </main>
    </div>
  );
}
