"use client";

import {
  Wallet,
  ShieldCheck,
  FileText,
  History,
  MessageSquare,
  Eye,
} from "lucide-react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { ApplicationHeader } from "./application-details/header";
import { SidebarActions } from "./application-details/sidebar-actions";
import { TabTrigger } from "./application-details/shared-components";
import { OverviewTab } from "./application-details/tabs/overview-tab";
import { FinancialTab } from "./application-details/tabs/financial-tab";
import { DocumentsTab } from "./application-details/tabs/documents-tab";
import { RepaymentTab } from "./application-details/tabs/repayment-tab";
import { HistoryTab } from "./application-details/tabs/history-tab";
import { ActivityTab } from "./application-details/tabs/activity-tab";
import { Application } from "./application-details/types";

interface ApplicationDetailsProps {
  application: Application;
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  // Extract credit report data
  const creditReport = application?.borrower?.creditReport?.entity;
  const creditScore = application?.borrower?.creditScore?.entity;
  const ficoScore = creditScore?.score?.ficoScore?.score;
  const ficoRating = creditScore?.score?.ficoScore?.rating;
  const gender = creditReport?.gender;
  console.log(gender, "gender")
  // Normalize risk score (assuming FICO range 300-850)
  const normalizedRiskScore = ficoScore
    ? Math.round(((ficoScore - 300) / (850 - 300)) * 100)
    : 0;

  const riskLevel =
    ficoRating ||
    (ficoScore
      ? ficoScore >= 670
        ? "Low"
        : ficoScore >= 580
          ? "Medium"
          : "High"
      : "Unknown");

  // Helper to get the maximum reported value from any bureau (conservative view of exposure)
  const maxBureauValue = (dataArray: any[]) => {
    if (!Array.isArray(dataArray)) return 0;
    return dataArray.reduce(
      (max, item) => Math.max(max, Number(item.value) || 0),
      0,
    );
  };

  const totalActiveLoans = maxBureauValue(
    creditReport?.score?.totalNoOfActiveLoans || [],
  );
  const totalOutstanding = maxBureauValue(
    creditReport?.score?.totalOutstanding || [],
  );
  const totalMonthlyInstallment = maxBureauValue(
    creditReport?.score?.totalMonthlyInstallment || [],
  );

  // Flatten and deduplicate loan history
  const allLoans =
    creditReport?.score?.loanHistory?.flatMap(
      (source: any) => source.value || [],
    ) || [];

  // Deduplicate by accountNumber
  const uniqueLoansMap = new Map();
  allLoans.forEach((loan: any) => {
    if (loan.accountNumber) {
      if (!uniqueLoansMap.has(loan.accountNumber)) {
        uniqueLoansMap.set(loan.accountNumber, loan);
      }
    } else {
      uniqueLoansMap.set(`no-acc-${Math.random()}`, loan);
    }
  });

  const loanHistory = Array.from(uniqueLoansMap.values());

  return (
    <div className="space-y-8 pb-32 relative">
      <ApplicationHeader application={application} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8">
          <Tabs defaultValue="overview" className="w-full">
            <div className="bg-white p-2 rounded-[32px] shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
              <TabsList className="bg-transparent h-14 w-full justify-start gap-1">
                <TabTrigger
                  value="overview"
                  icon={<Eye size={16} />}
                  label="Overview"
                />
                <TabTrigger
                  value="financial"
                  icon={<Wallet size={16} />}
                  label="Financial Details"
                />
                <TabTrigger
                  value="documents"
                  icon={<FileText size={16} />}
                  label="Documents"
                />
                {/* <TabTrigger
                  value="repayment"
                  icon={<ShieldCheck size={16} />}
                  label="Repayment"
                /> */}
                <TabTrigger
                  value="history"
                  icon={<History size={16} />}
                  label="History"
                />
                <TabTrigger
                  value="activity"
                  icon={<MessageSquare size={16} />}
                  label="Activity"
                />
              </TabsList>
            </div>

            <OverviewTab
              application={application}
              ficoScore={ficoScore}
              riskLevel={riskLevel}
              normalizedRiskScore={normalizedRiskScore}
              totalActiveLoans={totalActiveLoans}
              totalOutstanding={totalOutstanding}
            />

            <FinancialTab
              ficoScore={ficoScore}
              totalActiveLoans={totalActiveLoans}
              totalOutstanding={totalOutstanding}
              totalMonthlyInstallment={totalMonthlyInstallment}
            />

            <DocumentsTab borrowerId={application.borrower.id} />

            {/* <RepaymentTab application={application} /> */}

            <HistoryTab loanHistory={loanHistory} />

            <ActivityTab application={application} />
          </Tabs>
        </div>

        <SidebarActions application={application} />
      </div>
    </div>
  );
}
