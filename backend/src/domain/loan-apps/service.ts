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

    const totalApps = apps.length;
    const approvedApps = apps.filter(a => a.status === 'APPROVED');
    const approvalRate = totalApps > 0 ? (approvedApps.length / totalApps) * 100 : 0;

    const totalLoansDisbursed = loans.length;
    const defaultedLoans = loans.filter(l => l.status === 'DEFAULTED');
    const defaultRate = totalLoansDisbursed > 0 ? (defaultedLoans.length / totalLoansDisbursed) * 100 : 0;

    const avgDuration = approvedApps.length > 0 
        ? approvedApps.reduce((acc, app) => acc + app.durationMonths, 0) / approvedApps.length 
        : 0;

    const totalAmountValue = approvedApps.reduce((acc, app) => acc + Number(app.amount), 0);
    const avgAmount = approvedApps.length > 0 ? totalAmountValue / approvedApps.length : 0;

    // Cash Flow Calculations
    const totalDisbursed = loans.reduce((acc, l) => acc + Number(l.principal), 0);
    const totalRepaidAmount = repayments
        .filter(r => r.status === 'PAID')
        .reduce((acc, r) => acc + Number(r.amount), 0);
    
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
        trend: "0.0%", 
        trendUp: true 
      },
      { 
        key: "defaultRate", 
        label: "Default Rate", 
        value: `${defaultRate.toFixed(1)}%`, 
        trend: "0.0%", 
        trendUp: false 
      },
      { 
        key: "avgDuration", 
        label: "Avg. Duration", 
        value: `${avgDuration.toFixed(1)} mo`, 
        trend: "0.0", 
        trendUp: true 
      },
      { 
        key: "avgLoanAmount", 
        label: "Avg. Loan Amount", 
        value: formatCurrency(avgAmount), 
        trend: "₦0", 
        trendUp: true 
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
