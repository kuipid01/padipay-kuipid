/**
 * Dojah API Integration
 * Used for BVN, NIN, and identity verification
 * Documentation: https://docs.dojah.io/
 */

const DOJAH_BASE_URL = "https://api.dojah.io";
const DOJAH_APP_ID = process.env.DOJAH_APP_ID || "";
const DOJAH_SECRET_KEY = process.env.DOJAH_SECRET_KEY || "";

interface DojahResponse<T> {
    entity: T;
    error?: {
        code: string;
        message: string;
    };
}

interface BVNData {
    first_name: string;
    last_name: string;
    middle_name: string;
    date_of_birth: string;
    phone_number: string;
    gender: string;
    image: string;
    enrollment_bank: string;
    enrollment_branch: string;
    level_of_account: string;
    lga_of_origin: string;
    lga_of_residence: string;
    marital_status: string;
    nin: string;
    nationality: string;
    registration_date: string;
    residential_address: string;
    state_of_origin: string;
    state_of_residence: string;
    watch_listed: boolean;
}

interface NINData {
    first_name: string;
    last_name: string;
    middle_name: string;
    date_of_birth: string;
    gender: string;
    phone_number: string;
    photo: string;
    signature: string;
    employment_status: string;
    spoken_languages: string;
    nok_first_name: string;
    nok_last_name: string;
    nok_address: string;
    profession: string;
    religion: string;
    residential_address: string;
    state_of_origin: string;
    state_of_residence: string;
    title: string;
}

interface PhoneVerificationData {
    first_name: string;
    last_name: string;
    phone_number: string;
    network: string;
    date_of_birth: string;
    gender: string;
}

interface FaceMatchResult {
    match: boolean;
    confidence: number;
}

class DojahService {
    private headers: HeadersInit;

    constructor() {
        this.headers = {
            "Authorization": DOJAH_SECRET_KEY,
            "AppId": DOJAH_APP_ID,
            "Content-Type": "application/json",
        };
    }

    /**
     * Verify BVN and retrieve associated data
     */
    async verifyBVN(bvn: string): Promise<{ success: boolean; data?: BVNData; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/bvn?bvn=${bvn}`,
                {
                    method: "GET",
                    headers: this.headers,
                }
            );

            const result: DojahResponse<BVNData> = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "BVN verification failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah BVN verification error:", error);
            return {
                success: false,
                error: error.message || "Failed to verify BVN",
            };
        }
    }

    /**
     * Verify NIN and retrieve associated data
     */
    async verifyNIN(nin: string): Promise<{ success: boolean; data?: NINData; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/nin?nin=${nin}`,
                {
                    method: "GET",
                    headers: this.headers,
                }
            );

            const result: DojahResponse<NINData> = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "NIN verification failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah NIN verification error:", error);
            return {
                success: false,
                error: error.message || "Failed to verify NIN",
            };
        }
    }

    /**
     * Verify phone number and retrieve owner details
     */
    async verifyPhoneNumber(phoneNumber: string): Promise<{ success: boolean; data?: PhoneVerificationData; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/phone_number?phone_number=${phoneNumber}`,
                {
                    method: "GET",
                    headers: this.headers,
                }
            );

            const result: DojahResponse<PhoneVerificationData> = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "Phone verification failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah phone verification error:", error);
            return {
                success: false,
                error: error.message || "Failed to verify phone number",
            };
        }
    }

    /**
     * Match a selfie photo against BVN photo for liveness verification
     */
    async matchFaceWithBVN(bvn: string, selfieBase64: string): Promise<{ success: boolean; data?: FaceMatchResult; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/bvn/verify`,
                {
                    method: "POST",
                    headers: this.headers,
                    body: JSON.stringify({
                        bvn,
                        selfie_image: selfieBase64,
                    }),
                }
            );

            const result: DojahResponse<FaceMatchResult> = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "Face matching failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah face match error:", error);
            return {
                success: false,
                error: error.message || "Failed to match face",
            };
        }
    }

    /**
     * Advanced BVN lookup with additional details
     */
    async lookupBVNAdvanced(bvn: string): Promise<{ success: boolean; data?: BVNData & { image: string }; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/bvn/full?bvn=${bvn}`,
                {
                    method: "GET",
                    headers: this.headers,
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "BVN lookup failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah BVN advanced lookup error:", error);
            return {
                success: false,
                error: error.message || "Failed to lookup BVN",
            };
        }
    }

    /**
     * Generate virtual NIN (vNIN) from regular NIN
     */
    async generateVNIN(nin: string): Promise<{ success: boolean; vnin?: string; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/vnin`,
                {
                    method: "POST",
                    headers: this.headers,
                    body: JSON.stringify({ nin }),
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "vNIN generation failed",
                };
            }

            return {
                success: true,
                vnin: result.entity?.vnin,
            };
        } catch (error: any) {
            console.error("Dojah vNIN generation error:", error);
            return {
                success: false,
                error: error.message || "Failed to generate vNIN",
            };
        }
    }

    /**
     * Validate bank account number
     */
    async validateBankAccount(accountNumber: string, bankCode: string): Promise<{ success: boolean; data?: { account_name: string; account_number: string }; error?: string }> {
        try {
            const response = await fetch(
                `${DOJAH_BASE_URL}/api/v1/kyc/nuban?account_number=${accountNumber}&bank_code=${bankCode}`,
                {
                    method: "GET",
                    headers: this.headers,
                }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "Account validation failed",
                };
            }

            return {
                success: true,
                data: result.entity,
            };
        } catch (error: any) {
            console.error("Dojah bank account validation error:", error);
            return {
                success: false,
                error: error.message || "Failed to validate bank account",
            };
        }
    }
}

// Export singleton instance
export const dojah = new DojahService();

// Export types
export type { BVNData, NINData, PhoneVerificationData, FaceMatchResult };
