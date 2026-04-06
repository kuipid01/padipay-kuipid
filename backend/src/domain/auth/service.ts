import { usersRepo } from "./repo";
import { hashPassword, comparePassword, signToken } from "../../lib/auth";
import { InsertUserSession } from "../../zod-schemas/user";
import { brevo } from "../../lib/brevo";
import { randomBytes } from "crypto";

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

async saveSessions(data: InsertUserSession): Promise<void> {
  await usersRepo.saveSession(data);
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

  async forgotPassword(email: string): Promise<ServiceResult<{ success: true }>> {
    const user = await usersRepo.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return { success: true, data: { success: true } };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    await usersRepo.updateResetToken(email, token, expires);

    await brevo.sendPasswordResetEmail(email, token, user.fullName || undefined);

    return { success: true, data: { success: true } };
  },

  async resetPassword(token: string, newPassword: string): Promise<ServiceResult<{ success: true }>> {
    const user = await usersRepo.findByResetToken(token);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return {
        success: false,
        error: { code: 400, message: "Invalid or expired reset token" },
      };
    }

    const passwordHash = await hashPassword(newPassword);
    await usersRepo.updatePassword(user.id, passwordHash);

    return { success: true, data: { success: true } };
  },
};
