"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, History, Clock, AlertCircle } from "lucide-react";
import { useBorrower } from "@/hooks/use-user";
import { ApplyLoanModal } from "@/components/borrower/apply-loan-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface DashboardStats {
    activeLoansCount: number;
    totalBorrowedAmount: number;
    pendingPaymentsCount: number;
    overdueCount: number;
}

export default function BorrowerOverview() {
    const router = useRouter();
    const { borrower: user, isLoading: userLoading } = useBorrower();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/borrower/overview");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Active Loans",
            value: stats?.activeLoansCount ?? 0,
            icon: CreditCard,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Total Borrowed",
            value: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.totalBorrowedAmount ?? 0),
            icon: History,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Pending Payments",
            value: stats?.pendingPaymentsCount ?? 0,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            label: "Overdue",
            value: stats?.overdueCount ?? 0,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50"
        },
    ];

    return (
        <>
            <div className="space-y-8">
                <div>
                    {userLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-64 rounded-xl" />
                            <Skeleton className="h-4 w-48 rounded-lg" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-black text-main-green">
                                Welcome back, {user?.firstName + " " + user?.middleName + " " + user?.lastName || "Borrower"}!
                            </h1>
                            <p className="text-gray-500">Here's an overview of your loan status and activities.</p>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`size-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
                            {isLoading ? (
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            ) : (
                                <p className="text-2xl font-black text-main-green">{stat.value}</p>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-black text-main-green mb-6">Recent Activity</h2>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="flex items-center gap-4">
                                        <Skeleton className="size-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full rounded-lg" />
                                            <Skeleton className="h-3 w-2/3 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                                <p>No recent activity found.</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-main-green p-8 rounded-[40px] text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-4">Need Quick Funds?</h2>
                            <p className="text-white/80 mb-8 max-w-[300px]">Get instant access to loans with competitive interest rates and flexible repayment plans.</p>
                            {stats?.activeLoansCount === 0 ? <button
                                onClick={() => setShowApplyModal(true)}
                                className="bg-lemon-primary text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
                            >
                                Apply for a Loan
                            </button> : <button
                                onClick={() => router.push("/borrower/dashboard/loans")}
                                className="bg-lemon-primary text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
                            >
                                View Loan
                            </button>
                            }
                        </div>
                        <div className="absolute -right-10 -bottom-10 size-64 bg-white/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>

            <ApplyLoanModal
                open={showApplyModal}
                onOpenChange={setShowApplyModal}
                userPhone={user?.phone}
            />
        </>
    );
}
