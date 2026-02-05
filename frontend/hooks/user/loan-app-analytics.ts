import { useFetch } from "../general";
import { LoanApp } from "./loan-apps";

export const useUserLoanAppAnalytics = (appId: string) => {
  const {
    data: analytics,
    isLoading,
    error,
  } = useFetch<{
    metrics: {
      key: string;
      label: string;
      trend: string;
      trendUp: boolean;
      value: string;
    }[];
    cashFlow: {
      isPositive: boolean;
      netFlow: string;
      totalDisbursed: string;
      totalRepaid: string;
    };
    app: LoanApp;
  }>(`/api/loan-apps/${appId}/analytics`, { key: "loan-app-analytics" });
  return { analytics, isLoading, error };
};
