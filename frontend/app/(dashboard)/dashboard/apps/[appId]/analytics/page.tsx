"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoanApp } from "@/hooks/user/loan-apps";
import { useUserLoanAppAnalytics } from "../../../../../../hooks/user/loan-app-analytics";

type LoanAppResponse = {
  loanApp?: LoanApp;
  app?: LoanApp;
  data?: LoanApp;
};

type Metric = {
  key: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
};

type AnalyticsResponse = LoanAppResponse & {
  metrics?: Metric[];
};

export default function AppAnalyticsPage() {
  const params = useParams<{ appId: string }>();
  const router = useRouter();
  const appId = params?.appId;
  const [app, setApp] = useState<LoanApp | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const{analytics,error:analyticsError,isLoading:analyticsLoading} = useUserLoanAppAnalytics(appId)
console.log(analytics,"analytics")
  
  const performanceMetrics = useMemo(
    () =>
      metrics.length > 0
        ? metrics
        : [
            {
              key: "approvalRate",
              label: "Approval Rate",
              value: analytics?.metrics[0].value ?? "0%",
              trend: analytics?.metrics[0].trend ?? "0%",
              trendUp: analytics?.metrics[0].trendUp ,
            },
            {
              key: "defaultRate",
              label: "Default Rate",
              value: analytics?.metrics[1].value ?? "0%",
              trend: analytics?.metrics[1].value ?? "0%",
              trendUp: analytics?.metrics[1].trendUp,
            },
            {
              key: "avgDuration",
              label: "Avg. Duration",
              value:  analytics?.metrics[2].value ?? "",
              trend:  analytics?.metrics[2].trend ?? "",
              trendUp: analytics?.metrics[2].trendUp ?? false,
            },
            {
              key: "avgLoanAmount",
              label: "Avg. Loan Amount",
              value:  analytics?.metrics[3].value ?? "",
              trend:  analytics?.metrics[3].trend ?? "",
              trendUp:  analytics?.metrics[3].trendUp ?? "",
            },
          ],
    [metrics],
  );

  useEffect(() => {
    if (!appId) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/loan-apps/${appId}/analytics`)
      .then(async (res) => {
        const data = (await res.json()) as AnalyticsResponse | LoanApp;
        if (!res.ok) {
          const message =
            (data as { error?: string })?.error || "Failed to fetch loan app";
          throw new Error(message);
        }
        return data;
      })
      .then((data) => {
        if (!isMounted) return;
        const payload = data as AnalyticsResponse;
        const appData =
          payload.loanApp ?? payload.app ?? payload.data ?? (data as LoanApp);
        if (!appData?.id) {
          setError("Loan app not found.");
          return;
        }
        setApp(appData);
        if (Array.isArray(payload.metrics)) {
          setMetrics(payload.metrics);
        }
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20">
        <div className="h-8 w-64 rounded-lg bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[24px]">
              <CardContent className="p-6">
                <div className="h-3 w-24 bg-gray-100 rounded-full mb-3 animate-pulse" />
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="space-y-6">
        <p className="text-sm font-bold text-red-500">
          {error || "Unable to load this loan app."}
        </p>
        <Button
          variant="outline"
          className="border-gray-100 rounded-2xl font-bold h-11"
          onClick={() => router.push("/dashboard/apps")}
        >
          Back to Apps
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-gray-500 hover:text-main-green -ml-4"
          asChild
        >
          <Link href={`/dashboard/apps/${appId}`}>
            <ArrowLeft size={16} className="mr-2" /> Back to App
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-main-green tracking-tight">
              Analytics
            </h1>
            <p className="text-gray-500 font-medium">
              Performance insights for{" "}
              <span className="font-black text-main-green">{app.name}</span>
            </p>
          </div>
          <Button
            variant="outline"
            className="border-gray-100 rounded-2xl font-bold gap-2"
          >
            <Calendar size={16} /> Last 30 Days
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[24px]">
            <CardContent className="p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {metric.label}
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-main-green">
                  {metric.value}
                </h3>
                <Badge
                  className={cn(
                    "font-bold border-none",
                    metric.trendUp
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600",
                  )}
                >
                  {metric.trend}{" "}
                  {metric.trendUp ? (
                    <TrendingUp size={12} className="ml-1" />
                  ) : (
                    <TrendingDown size={12} className="ml-1" />
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
       

        {/* Mock Chart Area 2 */}
        <Card className="border-none shadow-sm rounded-[32px]">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-lg font-black text-main-green">
              Disbursement vs Repayment
            </CardTitle>
            <p className="text-sm text-gray-400 font-medium">
              Cash flow analysis
            </p>
          </CardHeader>
          <CardContent className="p-8 pt-4 h-[300px] flex items-end gap-3 justify-center">
            <div className="relative size-60 rounded-full border-[20px] border-gray-100 border-t-main-green border-r-lemon-primary flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Net Flow
                </p>
                <p className="text-3xl font-black text-main-green">{analytics?.cashFlow.netFlow}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 ml-8">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-1">
                  <div className="size-3 rounded-full bg-main-green" />{" "}
                  Disbursed
                </p>
                <p className="font-black text-lg pl-5 text-gray-800">{analytics?.cashFlow.totalDisbursed}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-1">
                  <div className="size-3 rounded-full bg-lemon-primary" />{" "}
                  Repaid
                </p>
                <p className="font-black text-lg pl-5 text-gray-800">{analytics?.cashFlow.totalRepaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="bg-main-green hidden text-white border-none shadow-lg rounded-[32px] overflow-hidden relative">
        <div className="absolute top-0 right-0 size-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h3 className="text-2xl font-black mb-2">Export Data</h3>
            <p className="text-white/60 font-medium max-w-md">
              Download comprehensive reports including loan performance,
              applicant demographics, and financial statements.
            </p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-white text-main-green hover:bg-gray-50 font-black h-12 px-8 rounded-2xl shadow-lg border-none">
              <Download size={18} className="mr-2" /> Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
