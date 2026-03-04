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

interface Borrower {
 user :{
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  }
}
export function useUser() {
  const query = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      
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
      
      return res.json();
    },
    retry: (failureCount, error) => {
      if (error.message === "Unauthorized") return false;
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    borrower: query?.data?.user,
    ...query
  };
}
