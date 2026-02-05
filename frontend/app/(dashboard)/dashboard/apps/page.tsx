"use client";
import { useGetUserLoanApps } from "../../../../hooks/user/loan-apps";
import { AppsList } from "../../../../components/dashboard/apps-list";

export default function AppsPage() {
  const { loanApps, error, isLoading } = useGetUserLoanApps();

  console.log(loanApps);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-main-green tracking-tight">
          Loan Apps
        </h1>
        <p className="text-gray-500 font-medium">
          Create and manage your loan application links.
        </p>
      </div>

      {loanApps?.loanApps && <AppsList initialApps={loanApps?.loanApps} />}
    </div>
  );
}
