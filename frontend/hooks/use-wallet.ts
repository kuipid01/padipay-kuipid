import { useQuery } from "@tanstack/react-query";

interface WalletBalances {
  balance: number;
  locked_balance: number;
  available_balance: number;
}

export function useWallet() {
  return useQuery<WalletBalances>({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      const res = await fetch("/api/lender/wallet");
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
