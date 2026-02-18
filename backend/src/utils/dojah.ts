import axios from "axios";

const DOJAH_BASE_URL = "https://api.dojah.io/api/v1";
const DOJAH_APP_ID = process.env.DOJAH_APP_ID;
const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY;

const dojahRequest = async (endpoint: string, params: Record<string, string> = {},timeout = 10000) => {
  try {
    const response = await axios.get(`${DOJAH_BASE_URL}${endpoint}`, {
      params,
      headers: {
        "AppId": DOJAH_APP_ID || "",
        "Authorization": DOJAH_SECRET_KEY || "",
        "Content-Type": "application/json",
      },
       timeout,
    });

    console.log(response.data, "Response gotten from dojah call");
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("Dojah API error:", errorData || error.message);
    throw new Error(errorData?.error || errorData?.message || "Dojah API request failed");
  }
};

/**
 * Verify BVN using Dojah
 * @param bvn Bank Verification Number
 */
export const verifyBVN = async (bvn: string) => {
  return dojahRequest("/kyc/bvn/full", { bvn });
};

/**
 * Verify NIN using Dojah
 * @param nin National Identification Number
 */
export const verifyNIN = async (nin: string) => {
  return dojahRequest("/kyc/nin", { nin });
};

/**
 * Resolve Bank Account using Dojah
 * @param accountNumber Bank Account Number
 * @param bankCode Bank Code (e.g., 011 for First Bank)
 */
export const resolveAccount = async (accountNumber: string, bankCode: string) => {
  return dojahRequest("/kyc/nuban", { account_number: accountNumber, bank_code: bankCode });
};

/**
 * Get Credit Report Summary using Dojah
 * @param bvn Bank Verification Number
 */
export const getCreditReport = async (bvn: string) => {
  console.log("Getting credit report for BVN:", bvn);
  return dojahRequest("/credit_bureau", { bvn });
};

/**
 * Get Credit Score using Dojah
 * @param bvn Bank Verification Number
 */
export const getCreditScore = async (bvn: string) => {
    console.log("Getting fico score for BVN:", bvn);
  return dojahRequest("/fico_score", { bvn });
};


