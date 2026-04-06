import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  paystackPublicKey: string | null;
  role: "admin" | "borrower" | "lender";
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  brandLogoUrl?: string;
  brandColor?: string;
  emailNotifyNewApplication?: boolean;
  emailNotifyPaymentReceived?: boolean;
  emailNotifyPaymentFailed?: boolean;
  emailNotifyLoanOverdue?: boolean;
  smsNotifyCriticalOnly?: boolean;
  disabledAt?: Date;
  plan?: "Basic" | "Pro" | "Enterprise";
  subscriptionStatus?: "active" | "inactive" | "expired" | "cancelled";
  subscriptionEndsAt?: string;
}

export interface Borrower {
  id: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  bvn: string;
  nin: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  dob: string;
  image: string | null;
  kycVerified: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  employmentType: string | null;
  monthlyIncome: string | null;
  employerName: string | null;
  bankAccounts?: any[];
  documents?: any[];
}
export function useUser() {
  const query = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
          console.log("RES", res)
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch user");
      }
      
      return res.json();
    },
    retry: (failureCount, error) => {
      if (error.message === "Unauthorized") return false;
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: query.data,
    ...query
  };
}
export function useBorrower() {
  const query = useQuery<Borrower>({
    queryKey: ["borrower"],
    queryFn: async () => {
      const res = await fetch("/api/borrower/auth/me");
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch borrower");
      }
      const data = await res.json();
      return data?.user || data; 
    },
    retry: (failureCount, error) => {
      if (error.message === "Unauthorized") return false;
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    borrower: query.data,
    ...query
  };
}
