"use client";
import { useGetUserLoanApps } from "../../../../hooks/user/loan-apps";
import { AppsList } from "../../../../components/dashboard/apps-list";
import { PageHeader } from "../../../../components/ui/page-header";
import { StatCardsSkeleton, AppCardsSkeleton } from "../../../../components/dashboard/skeletons";

export default function AppsPage() {
  const { loanApps, error, isLoading } = useGetUserLoanApps();

  console.log(loanApps);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Loan Apps" 
        description="Create and manage your loan application links."
      />

      {isLoading ? (
        <div className="space-y-6 mt-8">
          <StatCardsSkeleton count={3} />
          <AppCardsSkeleton count={3} />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-500 rounded-[32px] font-bold">
          Failed to load apps. Please try again.
        </div>
      ) : loanApps?.loanApps ? (
        <AppsList initialApps={loanApps.loanApps} />
      ) : null}
    </div>
  );
}
