import { usersRepo } from "./repo";
import { hashPassword, comparePassword, signToken } from "../../lib/auth";

export interface ServiceError {
  code: number;
  message: string;
}

export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

// User without password
type SafeUser = Omit<NonNullable<Awaited<ReturnType<typeof usersRepo.findById>>>, "passwordHash">;

/**
 * Auth service - business logic for authentication.
 */
export const authService = {
  async register(input: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }): Promise<ServiceResult<{ user: SafeUser; token: string }>> {
    if (!input.email || !input.password) {
      return {
        success: false,
        error: { code: 400, message: "Email and password are required" },
      };
    }

    const existingUser = await usersRepo.findByEmail(input.email);
    if (existingUser) {
      return {
        success: false,
        error: { code: 400, message: "User already exists" },
      };
    }

    const passwordHash = await hashPassword(input.password);

    const user = await usersRepo.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    });

    const token = await signToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { success: true, data: { user: userWithoutPassword, token } };
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<ServiceResult<{ user: SafeUser; token: string }>> {
    if (!input.email || !input.password) {
      return {
        success: false,
        error: { code: 400, message: "Email and password are required" },
      };
    }

    const user = await usersRepo.findByEmail(input.email);
    if (!user) {
      return {
        success: false,
        error: { code: 401, message: "Invalid credentials" },
      };
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: { code: 401, message: "Invalid credentials" },
      };
    }

    const token = await signToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return { success: true, data: { user: userWithoutPassword, token } };
  },

  async getMe(userId: string): Promise<ServiceResult<{ user: SafeUser | null }>> {
    const user = await usersRepo.findById(userId);
    
    if (!user) {
      return { success: true, data: { user: null } };
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { success: true, data: { user: userWithoutPassword } };
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<ServiceResult<{ success: true }>> {
    const user = await usersRepo.findById(userId);
    if (!user) {
      return {
        success: false,
        error: { code: 404, message: "User not found" },
      };
    }

    const isValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return {
        success: false,
        error: { code: 401, message: "Current password is incorrect" },
      };
    }

    const passwordHash = await hashPassword(newPassword);
    await usersRepo.updatePassword(userId, passwordHash);

    return { success: true, data: { success: true } };
  },
};
