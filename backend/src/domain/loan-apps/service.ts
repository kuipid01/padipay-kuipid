import { loanAppsRepo, type CreateLoanAppInput, type UpdateLoanAppInput } from "./repo";

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

  async getById(id: string, ownerId: string): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof loanAppsRepo.findById>>>>> {
    const app = await loanAppsRepo.findByIdAndOwner(id, ownerId);
    
    if (!app) {
      return { success: false, error: { code: 404, message: "App not found" } };
    }

    return { success: true, data: app };
  },

  async create(input: CreateLoanAppInput): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof loanAppsRepo.create>>>>> {
    // Validate required fields
    if (!input.name || !input.defaultInterestRate || !input.defaultDurationMonths || !input.slug) {
      return { 
        success: false, 
        error: { code: 400, message: "Missing required fields" } 
      };
    }

    // Check slug uniqueness
    const existingSlug = await loanAppsRepo.findBySlug(input.slug);
    if (existingSlug) {
      return { 
        success: false, 
        error: { code: 400, message: "Slug already taken" } 
      };
    }

    const loanApp = await loanAppsRepo.create({
      ...input,
      defaultInterestRate: input.defaultInterestRate.toString(),
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
      defaultInterestRate: input.defaultInterestRate?.toString(),
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
};
