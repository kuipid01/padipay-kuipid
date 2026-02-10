import { applicationsRepo } from "./repo";
import { UpdateApplicationInput } from "../../zod-schemas/applications";

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
  }
};
