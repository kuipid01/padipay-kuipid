import { LoanApp } from "../../../hooks/user/loan-apps";

export interface Application {
  id: string;
  amount: string;
  interestRate: string;
  durationMonths: number;
  status: string;
  createdAt: string;
  borrower: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    creditReport?: {
      entity?: {
        address?: string;
        score?: {
          ficoScore?: {
            score?: number;
            rating?: string;
            reasons?: string;
          };
          totalNoOfActiveLoans?: Array<{ value: number }>;
          totalOutstanding?: Array<{ value: number }>;
          totalMonthlyInstallment?: Array<{ value: number }>;
          loanHistory?: Array<{ value: any[] }>;
        };
        gender?: string;
        creditScore: Record<any, any>;
      };
    };
    creditScore?:any
  };
  loan?: {
    id: string;
    totalPayable: string;
    principal: string;
    interest: string;
    status: string;
    repayments: Array<{
      id: string;
      amount: string;
      dueDate: string;
      paidAt: string | null;
      status: string;
      payments?: Array<{
        id: string;
        amount: string;
        paidAt: string;
        method: string;
      }>;
    }>;
  };
  loanApp?:LoanApp
}
