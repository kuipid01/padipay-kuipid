/**
 * Common API response types
 */

export interface ApiError {
  error: string;
  message?: string;
  stack?: string;
}

export interface ApiSuccess<T = unknown> {
  data?: T;
  success?: boolean;
  message?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User types
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  createdAt: Date | null;
}

/**
 * Loan App types
 */
export interface LoanAppResponse {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  defaultInterestRate: string;
  defaultDurationMonths: number;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface CreateLoanAppRequest {
  name: string;
  slug: string;
  defaultInterestRate: number | string;
  defaultDurationMonths: number;
}

export interface UpdateLoanAppRequest {
  name?: string;
  slug?: string;
  defaultInterestRate?: number | string;
  defaultDurationMonths?: number;
  isActive?: boolean;
}

/**
 * Auth types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

/**
 * OTP types
 */
export interface SendOTPRequest {
  type: "phone" | "email";
  value: string;
}

export interface VerifyOTPRequest {
  type: "phone" | "email";
  value: string;
  otp: string;
}
