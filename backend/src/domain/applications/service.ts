import { applicationsRepo } from "./repo";
import { UpdateApplicationInput } from "../../zod-schemas/applications";
import { db } from "../../db";
import { loans, repayments, loanApplications } from "../../db/schema";
import { eq } from "drizzle-orm";
import { generateRepaymentSchedule } from "../../utils/loan-math";

export interface ServiceError {
  code: number;
  message: string;
}

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export const applicationsService = {
  async getAll(ownerId: string): Promise<ServiceResult<Awaited<ReturnType<typeof applicationsRepo.findAllByOwner>>>> {
    const apps = await applicationsRepo.findAllByOwner(ownerId);
    return { success: true, data: apps };
  },

  async getPublicStatus(id: string): Promise<ServiceResult<any>> {
    const app = await applicationsRepo.findByIdPublic(id);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    return { success: true, data: app };
  },

  async getById(id: string, ownerId: string): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof applicationsRepo.findByIdAndOwner>>>>> {
    const app = await applicationsRepo.findByIdAndOwner(id, ownerId);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    return { success: true, data: app };
  },

  async update(id: string, ownerId: string, data: UpdateApplicationInput): Promise<ServiceResult<any>> {
    const app = await applicationsRepo.findByIdAndOwner(id, ownerId);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    const updated = await applicationsRepo.update(id, data);
    return { success: true, data: updated };
  },

  async approve(id: string, lenderId: string): Promise<ServiceResult<any>> {
    const application = await applicationsRepo.findByIdAndOwner(id, lenderId);
    
    if (!application) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    if (application.status !== "PENDING") {
      return { success: false, error: { code: 400, message: "Application already processed" } };
    }

    try {
      const result = await db.transaction(async (tx) => {
        // 1. Calculate totals
        const principal = Number.parseFloat(application.amount.toString());
        const interestRate = application.repaymentPlan.interestRate;
        const duration = application.durationMonths;
        const totalInterest = (principal * interestRate) / 100;
        const totalPayable = principal + totalInterest;

        // 2. Create Loan
        const [loan] = await tx.insert(loans).values({
          applicationId: application.id,
          lenderId: lenderId,
          borrowerId: application.borrowerId,
          principal: application.amount,
          interest: totalInterest.toFixed(2),
          totalPayable: totalPayable.toFixed(2),
          status: "ACTIVE",
        }).returning();

        // 3. Generate Repayments
        const schedule = generateRepaymentSchedule(principal, interestRate, duration, new Date());
        
        for (const item of schedule) {
          await tx.insert(repayments).values({
            loanId: loan.id,
            amount: item.amount.toFixed(2),
            dueDate: item.dueDate,
            status: "PENDING",
          });
        }

        // 4. Update Application Status
        await tx.update(loanApplications)
          .set({ status: "APPROVED" })
          .where(eq(loanApplications.id, application.id));

        return { loan, repayments: schedule };
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("Approve loan error:", error);
      return { success: false, error: { code: 500, message: "Failed to approve loan" } };
    }
  }
};
