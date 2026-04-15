"use client";

import { useQuery } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminOverview {
  totalRequests: number;
  totalBorrowers: number;
  activeLenders: number;
  totalDisbursedNGN: number;
  pendingRequests: number;
  pendingKycLenders: number;
  overdueRepayments: number;
}

export interface AdminRequest {
  id: string;
  borrower: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  lender: {
    id: string;
    businessName: string;
  };
  amount: string;
  durationDays: number;
  interestRate: string;
  status: "PENDING" | "APPROVED" | "FUNDED" | "REJECTED";
  createdAt: string;
}

export interface AdminBorrower {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  state?: string;
  totalLoans: number;
  totalBorrowedNGN: number;
  lastActivityAt: string;
  status: "ACTIVE" | "INACTIVE" | "DEFAULTED";
  creditScore?: number;
}

export interface AdminLender {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  plan: "Starter" | "Growth" | "Enterprise";
  activeApps: number;
  totalDisbursedNGN: number;
  totalBorrowers: number;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_KYC";
  kycVerified: boolean;
  createdAt: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminOverview() {
  return useQuery<AdminOverview>({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) throw new Error("Failed to fetch admin overview");
      return res.json();
    },
  });
}

export function useAdminRequests(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.offset !== undefined) qs.set("offset", String(params.offset));

  const queryString = qs.toString();

  return useQuery<{ requests: AdminRequest[]; total: number }>({
    queryKey: ["admin-requests", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/requests${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch admin requests");
      return res.json();
    },
  });
}

export function useAdminBorrowers(params?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.offset !== undefined) qs.set("offset", String(params.offset));

  const queryString = qs.toString();

  return useQuery<{ borrowers: AdminBorrower[]; total: number }>({
    queryKey: ["admin-borrowers", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/borrowers${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch admin borrowers");
      return res.json();
    },
  });
}

export function useAdminLenders(params?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.offset !== undefined) qs.set("offset", String(params.offset));

  const queryString = qs.toString();

  return useQuery<{ lenders: AdminLender[]; total: number }>({
    queryKey: ["admin-lenders", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/lenders${queryString ? `?${queryString}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch admin lenders");
      return res.json();
    },
  });
}
