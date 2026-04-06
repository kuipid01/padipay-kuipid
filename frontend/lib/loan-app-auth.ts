"use server"
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { LoanApp } from "../hooks/user/loan-apps";
import { Borrower } from "../hooks/use-user";
import React from "react";


   const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

type AuthStatus = {
  isLoggedIn: boolean;
  isBorrower: boolean;
  loanAppOwnedByLoggedInUser: boolean;
};

type AuthResult = {
  authStatus: AuthStatus;
  user: any | null;
};

const DEFAULT_STATE: AuthResult = {
  authStatus: {
    isLoggedIn: false,
    isBorrower: false,
    loanAppOwnedByLoggedInUser: false,
  },
  user: null,
};

export const getAuthStatus = async (slug?: string): Promise<AuthResult> => {
  if (!slug) return DEFAULT_STATE;

  const cookieStore = await  cookies();

  const token = cookieStore.get("token")?.value;
  const borrowerToken = cookieStore.get("borrower_token")?.value;

  let user = null;
  let isBorrower = false;

  // 🔹 1. Check borrower token first (more specific)
  if (borrowerToken) {
    const payload = await verifyToken(borrowerToken);

    if (payload) {
      user = payload;
      isBorrower = true;
    }
  }

  // 🔹 2. Fallback to normal token
  if (!user && token) {
    const payload = await verifyToken(token);

    if (payload) {
      user = payload;
      isBorrower = false;
    }
  }

  // 🔹 3. If no valid user
  if (!user) return DEFAULT_STATE;

  // 🔹 4. Ownership check (IMPORTANT)
const loanApp =  await getLoanApp(slug)
 
  const loanAppOwnedByLoggedInUser = user?.id === loanApp.ownerId;

  return {
    user,
    authStatus: {
      isLoggedIn: true,
      isBorrower,
      loanAppOwnedByLoggedInUser,
    },
  };
};


const getLoanApp = async  (slug:string) => {
       const res = await fetch(`${backendUrl}/api/loan-apps/public/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
const data = await  res.json()
    return data as LoanApp
}


export const getBorrower = async () => {
    const cookieStore = await  cookies();
    const borrowerToken = cookieStore.get("borrower_token")?.value;
    const res = await fetch(`${backendUrl}/api/borrower/auth/me`, {
      method: "GET",
      headers: {
             Authorization: `Bearer ${borrowerToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await  res.json()
    console.log(data,"DATA")
    return data as {
        user :Borrower

    } 
   
};

export const getBorrowerCompletionMap = async (borrower: Borrower) => {
    return {
        personalInfoComplete: !!(borrower.firstName && borrower.lastName && borrower.dob && borrower.gender),
        contactComplete: !!(borrower.email && borrower.phone && borrower.address && borrower.city && borrower.country),
        bvnVerified: !!(borrower.bvn && borrower.kycVerified),
        bankDetailsProvided: !!(borrower.bankAccounts && borrower.bankAccounts.length > 0),
        documentsProvided: !!(borrower.documents && borrower.documents.length > 0),
        employmentComplete: !!(borrower.employmentType && borrower.monthlyIncome && borrower.employerName),
    };
};


