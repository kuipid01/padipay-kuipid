"use client";

import { History } from "lucide-react";

export default function LoanHistoryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="size-12 bg-lemon-primary/10 text-main-green rounded-2xl flex items-center justify-center">
                    <History size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-main-green">Loan History</h1>
                    <p className="text-gray-500">View all your previous and current loan applications.</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-gray-400 font-bold italic">No loans found in your history.</p>
                    <button className="text-main-green font-black hover:underline underline-offset-4">Apply for your first loan</button>
                </div>
            </div>
        </div>
    );
}
