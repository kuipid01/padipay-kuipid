import { UpdateRepaymentPlanInput } from "../../zod-schemas/repayment-plans";
import { repaymentPlansRepo } from "./repo";

export interface ServiceError {
  code: number;
  message: string;
}

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Service layer for repayment plans business logic.
 */
export const repaymentPlansService = {
  async getById(id: string): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repaymentPlansRepo.findById>>>>> {
    const plan = await repaymentPlansRepo.findById(id);
    
    if (!plan) {
      return { success: false, error: { code: 404, message: "Repayment plan not found" } };
    }

    return { success: true, data: plan };
  },

  async getByAppId(loanAppId: string): Promise<ServiceResult<Awaited<ReturnType<typeof repaymentPlansRepo.findByAppId>>>> {
    const plans = await repaymentPlansRepo.findByAppId(loanAppId);
    return { success: true, data: plans };
  },

  async update(id: string, userId: string, data: UpdateRepaymentPlanInput): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof repaymentPlansRepo.update>>>>> {
    // Verify ownership
    const plan = await repaymentPlansRepo.findByIdWithOwner(id);
    if (!plan) {
      return { success: false, error: { code: 404, message: "Repayment plan not found" } };
    }

    if (plan.loanApp.ownerId !== userId) {
      return { success: false, error: { code: 403, message: "Forbidden: You do not own this plan" } };
    }

    const updatedPlan = await repaymentPlansRepo.update(id, data);
    if (!updatedPlan) {
      return { success: false, error: { code: 500, message: "Failed to update repayment plan" } };
    }

    return { success: true, data: updatedPlan };
  }
};
