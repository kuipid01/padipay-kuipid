import axios from "axios";
import { isTestSuite } from "../lib/suite";
import {
  mockYouverifyCreditReport,
  mockYouverifyBvnEntity,
  mockYouverifyNinEntity,
  mockYouverifyPhoneEntity,
} from "../test-suite/external-mocks";

const YOUVERIFY_BASE_URL =
  process.env.YOUVERIFY_BASE_URL || "https://api.youverify.co";
const YOUVERIFY_TOKEN = process.env.YOUVERIFY_TOKEN;

// ─── Internal HTTP helper ────────────────────────────────────────────────────

const youverifyPost = async (
  endpoint: string,
  body: Record<string, unknown>,
  timeout = 50000,
) => {
  try {
    const response = await axios.post(
      `${YOUVERIFY_BASE_URL}${endpoint}`,
      body,
      {
        headers: {
          token: YOUVERIFY_TOKEN || "",
          "Content-Type": "application/json",
        },
        timeout,
      },
    );
    console.log("[YouVerify] Response received for", endpoint);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("[YouVerify] API error:", errorData || error.message);
    throw new Error(
      errorData?.message ||
        errorData?.error ||
        "YouVerify API request failed",
    );
  }
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface YouverifyCreditReport {
  provider: "youverify" | "mock:youverify";
  status: string;
  idNumber: string;
  personalDetails: Record<string, unknown> | null;
  creditAccountSummary: Record<string, unknown> | null;
  creditAccountRating: Record<string, unknown> | null;
  creditAgreements: Record<string, unknown>[];
  paymentHistory: Record<string, unknown>[];
  delinquency: Record<string, unknown>[];
  generatedAt: string;
  raw?: Record<string, unknown>;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get Nigerian Individual Credit Report using YouVerify.
 *
 * @param id          BVN, Mobile Number, National ID, Pencom ID or Driver's
 *                    Licence number of the individual.
 * @param enquiryReason  Reason string (defaults to "borrower_existing_credit").
 */
export const getNgCreditReport = async (
  id: string,
  enquiryReason = "borrower_existing_credit",
): Promise<YouverifyCreditReport> => {
  if (isTestSuite()) return mockYouverifyCreditReport(id);

  const raw = await youverifyPost(
    "/v2/api/identity/credit-report/ng/individual",
    {
      id,
      isSubjectConsent: true,
      consumerName: "",
      accountNumber: "",
      dateOfBirth: "",
      enquiryReason,
    },
  );

  const report = raw?.data;
  if (!report) {
    throw new Error("No credit report data returned from YouVerify");
  }

  return {
    provider: "youverify",
    status: report.status,
    idNumber: report.idNumber,
    personalDetails: report.personalDetailsSummary?.[0] ?? null,
    creditAccountSummary: report.creditAccountSummary?.[0] ?? null,
    creditAccountRating: report.creditAccountRating?.[0] ?? null,
    creditAgreements: report.creditAgreementSummary ?? [],
    paymentHistory: report.accountMonthlyPaymentHistory ?? [],
    delinquency: report.deliquencyInformation ?? [],
    generatedAt: report.requestedAt ?? new Date().toISOString(),
    raw: report,
  };
};

/**
 * Verify BVN using YouVerify (primary — cheaper than Dojah).
 * Response is normalised to { entity } matching Dojah's shape so callers
 * don't need to change.
 *
 * @param bvn  11-digit Bank Verification Number
 */
export const verifyNgBvn = async (bvn: string) => {
  if (isTestSuite()) return { entity: mockYouverifyBvnEntity(bvn) };

  const raw = await youverifyPost("/v2/api/identity/ng/bvn", {
    id: bvn,
    isSubjectConsent: true,
    premiumBVN: true,
  });

  const d = raw?.data;
  if (!d) throw new Error("No BVN data returned from YouVerify");

  // Normalise to Dojah entity shape
  return {
    entity: {
      bvn: d.idNumber ?? bvn,
      first_name: d.firstName ?? "",
      last_name: d.lastName ?? "",
      middle_name: d.middleName ?? "",
      gender: d.gender ?? "",
      date_of_birth: d.dateOfBirth ?? "",
      dob: d.dateOfBirth ?? "",
      phone_number: d.mobile ?? "",
      image: d.image ?? "",
      state_of_origin: d.stateOfOrigin ?? "",
      state_of_residence: d.stateOfResidence ?? "",
      nin: d.nin ?? "",
    },
  };
};

/**
 * Verify NIN using YouVerify (primary — cheaper than Dojah).
 * Response normalised to { entity } matching Dojah's shape.
 *
 * @param nin  11-digit National Identification Number
 */
export const verifyNgNin = async (nin: string) => {
  if (isTestSuite()) return { entity: mockYouverifyNinEntity(nin) };

  const raw = await youverifyPost("/v2/api/identity/ng/nin", {
    id: nin,
    isSubjectConsent: true,
    premiumNIN: true,
  });

  const d = raw?.data;
  if (!d || d.status === "not_found") {
    throw new Error(d?.reason || "NIN not found on YouVerify");
  }

  return {
    entity: {
      nin: d.idNumber ?? nin,
      first_name: d.firstName ?? "",
      last_name: d.lastName ?? "",
      middle_name: d.middleName ?? "",
      gender: d.gender ?? "",
      date_of_birth: d.dateOfBirth ?? "",
      dob: d.dateOfBirth ?? "",
      phone_number: d.mobile ?? "",
      image: d.image ?? "",
      photo: d.image ?? "",
      bvn: d.bvn ?? "",
      state_of_origin: d.birthState ?? "",
      state_of_residence: d.address?.state ?? "",
    },
  };
};

/**
 * Verify phone number using YouVerify.
 * Returns the owner details for a Nigerian mobile number.
 *
 * @param mobile  Nigerian phone number (e.g. "08000000000")
 */
export const verifyNgPhone = async (mobile: string) => {
  if (isTestSuite()) return { entity: mockYouverifyPhoneEntity(mobile) };

  const raw = await youverifyPost("/v2/api/identity/ng/phone", {
    mobile,
    isSubjectConsent: true,
  });

  const d = raw?.data;
  if (!d || d.status === "not_found") {
    throw new Error("Phone number not found on YouVerify");
  }

  // phoneDetails is an array of possible owners
  const owner = d.phoneDetails?.[0];
  const nameParts = (owner?.fullName ?? "").split(" ");

  return {
    entity: {
      phone_number: d.idNumber ?? mobile,
      first_name: nameParts[1] ?? nameParts[0] ?? "",
      last_name: nameParts[0] ?? "",
      middle_name: nameParts[2] ?? "",
      date_of_birth: owner?.dateOfBirth ?? "",
      dob: owner?.dateOfBirth ?? "",
    },
  };
};
