import { UpdateLoanAppInput } from "../../zod-schemas/loan-apps";
import { loanAppsRepo } from "./repo";
import { CreateLoanAppInput } from "./types";

export interface ServiceError {
  code: number;
  message: string;
}

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Service layer for loan apps business logic.
 * Extracted from the original API routes - handles validation and business rules.
 */
export const loanAppsService = {
  async getAll(ownerId: string): Promise<ServiceResult<Awaited<ReturnType<typeof loanAppsRepo.findByOwner>>>> {
    const apps = await loanAppsRepo.findByOwner(ownerId);
    return { success: true, data: apps };
  },

  async getPublicById(id: string): Promise<ServiceResult<any>> {
    const app = await loanAppsRepo.getPublicById(id);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    return { success: true, data: app };
  },

  async getPublicBySlug(slug: string): Promise<ServiceResult<any>> {
    const app = await loanAppsRepo.findBySlug(slug);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    return { success: true, data: app };
  },

  async getById(id: string, ownerId: string): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof loanAppsRepo.findById>>>>> {
    const app = await loanAppsRepo.findByIdAndOwner(id, ownerId);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    return { success: true, data: app };
  },

  async create(input: CreateLoanAppInput): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof loanAppsRepo.create>>>>> {
   

    // Check slug uniqueness
    const existingSlug = await loanAppsRepo.findBySlug(input.slug);
    if (existingSlug) {
      return { 
        success: false, 
        error: { code: 400, message: "Slug already taken" } 
      };
    }

    const loanApp = await loanAppsRepo.create({
      ...input
    });

    return { success: true, data: loanApp };
  },

  async update(
    id: string, 
    ownerId: string, 
    input: UpdateLoanAppInput
  ): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof loanAppsRepo.update>>>>> {
    // Verify ownership
    const existingApp = await loanAppsRepo.findByIdAndOwner(id, ownerId);
    if (!existingApp) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    // If slug is being changed, check for uniqueness
    if (input.slug && input.slug !== existingApp.slug) {
      const slugExists = await loanAppsRepo.findBySlug(input.slug);
      if (slugExists) {
        return { 
          success: false, 
          error: { code: 400, message: "Slug already in use" } 
        };
      }
    }

    const updatedApp = await loanAppsRepo.update(id, {
      ...input,
    });

    return { success: true, data: updatedApp };
  },

  async delete(id: string, ownerId: string): Promise<ServiceResult<{ success: true }>> {
    // Verify ownership
    const existingApp = await loanAppsRepo.findByIdAndOwner(id, ownerId);
    if (!existingApp) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    await loanAppsRepo.delete(id);
    return { success: true, data: { success: true } };
  },

  async getAnalytics(id: string, ownerId: string): Promise<ServiceResult<any>> {
    const app = await loanAppsRepo.findByIdAndOwner(id, ownerId);
    if (!app) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    const { apps, loans, repayments } = await loanAppsRepo.getAnalyticsData(id);

    // Date helpers for Trend Calculation (This Month vs Last Month)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const isInMonth = (date: Date | null, start: Date, end: Date) => {
        if (!date) return false;
        const d = new Date(date);
        return d >= start && d <= end;
    };

    const isThisMonth = (d: Date | null) => isInMonth(d, startOfThisMonth, now);
    const isLastMonth = (d: Date | null) => isInMonth(d, startOfLastMonth, endOfLastMonth);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0.0%";
        const percent = ((current - previous) / previous) * 100;
        return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
    };

    // 1. Approval Rate calculations
    const approvedApps = apps.filter(a => a.status === 'APPROVED');
    const totalApps = apps.length;
    const approvalRate = totalApps > 0 ? (approvedApps.length / totalApps) * 100 : 0;

    const thisMonthApps = apps.filter(a => isThisMonth(a.createdAt));
    const lastMonthApps = apps.filter(a => isLastMonth(a.createdAt));
    const thisMonthApprovalRate = thisMonthApps.length > 0 ? (thisMonthApps.filter(a => a.status === 'APPROVED').length / thisMonthApps.length) * 100 : 0;
    const lastMonthApprovalRate = lastMonthApps.length > 0 ? (lastMonthApps.filter(a => a.status === 'APPROVED').length / lastMonthApps.length) * 100 : 0;
    const approvalTrend = calculateTrend(thisMonthApprovalRate, lastMonthApprovalRate);

    // 2. Default Rate calculations
    const totalLoansDisbursed = loans.length;
    const defaultedLoans = loans.filter(l => l.status === 'DEFAULTED');
    const defaultRate = totalLoansDisbursed > 0 ? (defaultedLoans.length / totalLoansDisbursed) * 100 : 0;

    const thisMonthLoans = loans.filter(l => isThisMonth(l.startDate));
    const lastMonthLoans = loans.filter(l => isLastMonth(l.startDate));
    const thisMonthDefaultRate = thisMonthLoans.length > 0 ? (thisMonthLoans.filter(l => l.status === 'DEFAULTED').length / thisMonthLoans.length) * 100 : 0;
    const lastMonthDefaultRate = lastMonthLoans.length > 0 ? (lastMonthLoans.filter(l => l.status === 'DEFAULTED').length / lastMonthLoans.length) * 100 : 0;
    const defaultTrend = calculateTrend(thisMonthDefaultRate, lastMonthDefaultRate);

    // 3. Avg Duration calculations
    const avgDuration = approvedApps.length > 0 
        ? approvedApps.reduce((acc, app) => acc + app.durationMonths, 0) / approvedApps.length 
        : 0;

    const thisMonthApprovedApps = thisMonthApps.filter(a => a.status === 'APPROVED');
    const lastMonthApprovedApps = lastMonthApps.filter(a => a.status === 'APPROVED');
    const thisMonthAvgDuration = thisMonthApprovedApps.length > 0 ? thisMonthApprovedApps.reduce((acc, a) => acc + a.durationMonths, 0) / thisMonthApprovedApps.length : 0;
    const lastMonthAvgDuration = lastMonthApprovedApps.length > 0 ? lastMonthApprovedApps.reduce((acc, a) => acc + a.durationMonths, 0) / lastMonthApprovedApps.length : 0;
    const durationTrend = calculateTrend(thisMonthAvgDuration, lastMonthAvgDuration);

    // 4. Avg Loan Amount calculations
    const totalAmountValue = approvedApps.reduce((acc, app) => acc + Number(app.amount), 0);
    const avgAmount = approvedApps.length > 0 ? totalAmountValue / approvedApps.length : 0;

    const thisMonthAvgAmount = thisMonthApprovedApps.length > 0 ? thisMonthApprovedApps.reduce((acc, a) => acc + Number(a.amount), 0) / thisMonthApprovedApps.length : 0;
    const lastMonthAvgAmount = lastMonthApprovedApps.length > 0 ? lastMonthApprovedApps.reduce((acc, a) => acc + Number(a.amount), 0) / lastMonthApprovedApps.length : 0;
    const amountTrend = calculateTrend(thisMonthAvgAmount, lastMonthAvgAmount);

    // Cash Flow Calculations (using subRepayments)
    const totalDisbursed = loans.reduce((acc, l) => acc + Number(l.principal), 0);
    const totalRepaidAmount = (repayments as any[]).reduce((acc, r) => {
        const subTotal = (r.subRepayments || [])
            .filter((sr: any) => sr.status === 'PAID')
            .reduce((sAcc: number, sr: any) => sAcc + Number(sr.amount), 0);
        return acc + subTotal;
    }, 0);
    
    const netFlow = totalDisbursed > 0 
        ? ((totalRepaidAmount - totalDisbursed) / totalDisbursed) * 100 
        : 0;

    const formatCurrency = (val: number) => {
      if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
      if (val >= 1_000) return `₦${(val / 1_000).toFixed(1)}K`;
      return `₦${val.toLocaleString()}`;
    };

    const metrics = [
      { 
        key: "approvalRate", 
        label: "Approval Rate", 
        value: `${approvalRate.toFixed(1)}%`, 
        trend: approvalTrend, 
        trendUp: parseFloat(approvalTrend) >= 0 
      },
      { 
        key: "defaultRate", 
        label: "Default Rate", 
        value: `${defaultRate.toFixed(1)}%`, 
        trend: defaultTrend, 
        trendUp: parseFloat(defaultTrend) <= 0 
      },
      { 
        key: "avgDuration", 
        label: "Avg. Duration", 
        value: `${avgDuration.toFixed(1)} mo`, 
        trend: durationTrend, 
        trendUp: parseFloat(durationTrend) >= 0 
      },
      { 
        key: "avgLoanAmount", 
        label: "Avg. Loan Amount", 
        value: formatCurrency(avgAmount), 
        trend: amountTrend, 
        trendUp: parseFloat(amountTrend) >= 0 
      },
    ];

    return { 
      success: true, 
      data: { 
        app, 
        metrics,
        cashFlow: {
          totalDisbursed: formatCurrency(totalDisbursed),
          totalRepaid: formatCurrency(totalRepaidAmount),
          netFlow: `${netFlow >= 0 ? '+' : ''}${netFlow.toFixed(1)}%`,
          isPositive: netFlow >= 0
        }
      } 
    };
  }
};
