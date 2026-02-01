/**
 * Termii API Integration
 * Used for SMS and OTP services
 * Documentation: https://developers.termii.com/
 */

const TERMII_BASE_URL = "https://api.ng.termii.com/api";
const TERMII_API_KEY = process.env.TERMII_API_KEY || "";
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "PadiLoan";

interface TermiiResponse {
    code?: string;
    message_id?: string;
    message?: string;
    balance?: number;
    user?: string;
    pinId?: string;
    to?: string;
    smsStatus?: string;
    status?: string;
    error?: string;
}

interface SendSMSOptions {
    to: string;
    message: string;
    channel?: "generic" | "dnd" | "whatsapp";
}

interface SendOTPOptions {
    to: string;
    pinType?: "NUMERIC" | "ALPHANUMERIC";
    pinLength?: number;
    pinTimeToLive?: number; // in minutes
    pinAttempts?: number;
    channel?: "generic" | "dnd" | "whatsapp";
}

interface VerifyOTPOptions {
    pinId: string;
    pin: string;
}

interface OTPResponse {
    pinId: string;
    to: string;
    smsStatus: string;
}

interface VerifyResponse {
    verified: boolean;
    msisdn: string;
    attemptsRemaining: number;
}

class TermiiService {
    private apiKey: string;
    private senderId: string;

    constructor() {
        this.apiKey = TERMII_API_KEY;
        this.senderId = TERMII_SENDER_ID;
    }

    /**
     * Send a simple SMS message
     */
    async sendSMS(options: SendSMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/sms/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    to: options.to,
                    from: this.senderId,
                    sms: options.message,
                    type: "plain",
                    channel: options.channel || "generic",
                }),
            });

            const result: TermiiResponse = await response.json();

            if (!response.ok || result.code !== "ok") {
                return {
                    success: false,
                    error: result.message || "Failed to send SMS",
                };
            }

            return {
                success: true,
                messageId: result.message_id,
            };
        } catch (error: any) {
            console.error("Termii SMS error:", error);
            return {
                success: false,
                error: error.message || "Failed to send SMS",
            };
        }
    }

    /**
     * Send OTP via SMS
     */
    async sendOTP(options: SendOTPOptions): Promise<{ success: boolean; pinId?: string; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/sms/otp/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    message_type: options.pinType || "NUMERIC",
                    to: options.to,
                    from: this.senderId,
                    channel: options.channel || "generic",
                    pin_attempts: options.pinAttempts || 3,
                    pin_time_to_live: options.pinTimeToLive || 10,
                    pin_length: options.pinLength || 6,
                    pin_placeholder: "< 1234 >",
                    message_text: `Your PadiLoan verification code is < 1234 >. Valid for ${options.pinTimeToLive || 10} minutes. Do not share this code with anyone.`,
                }),
            });

            const result: TermiiResponse = await response.json();

            if (!response.ok || !result.pinId) {
                return {
                    success: false,
                    error: result.message || "Failed to send OTP",
                };
            }

            return {
                success: true,
                pinId: result.pinId,
            };
        } catch (error: any) {
            console.error("Termii OTP send error:", error);
            return {
                success: false,
                error: error.message || "Failed to send OTP",
            };
        }
    }

    /**
     * Verify OTP
     */
    async verifyOTP(options: VerifyOTPOptions): Promise<{ success: boolean; verified?: boolean; attemptsRemaining?: number; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/sms/otp/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    pin_id: options.pinId,
                    pin: options.pin,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    verified: false,
                    error: result.message || "OTP verification failed",
                };
            }

            return {
                success: true,
                verified: result.verified === "True" || result.verified === true,
                attemptsRemaining: result.msisdn_attempts_remaining,
            };
        } catch (error: any) {
            console.error("Termii OTP verify error:", error);
            return {
                success: false,
                verified: false,
                error: error.message || "Failed to verify OTP",
            };
        }
    }

    /**
     * Send OTP via Voice Call
     */
    async sendVoiceOTP(to: string, pinLength: number = 6): Promise<{ success: boolean; pinId?: string; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/sms/otp/send/voice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    phone_number: to,
                    pin_attempts: 3,
                    pin_time_to_live: 10,
                    pin_length: pinLength,
                }),
            });

            const result: TermiiResponse = await response.json();

            if (!response.ok || !result.pinId) {
                return {
                    success: false,
                    error: result.message || "Failed to send voice OTP",
                };
            }

            return {
                success: true,
                pinId: result.pinId,
            };
        } catch (error: any) {
            console.error("Termii voice OTP error:", error);
            return {
                success: false,
                error: error.message || "Failed to send voice OTP",
            };
        }
    }

    /**
     * Get account balance
     */
    async getBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/get-balance?api_key=${this.apiKey}`, {
                method: "GET",
            });

            const result: TermiiResponse = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.message || "Failed to get balance",
                };
            }

            return {
                success: true,
                balance: result.balance,
            };
        } catch (error: any) {
            console.error("Termii balance error:", error);
            return {
                success: false,
                error: error.message || "Failed to get balance",
            };
        }
    }

    /**
     * Check phone number status (DND check)
     */
    async checkPhoneStatus(phoneNumber: string): Promise<{ success: boolean; status?: string; network?: string; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/check/dnd?api_key=${this.apiKey}&phone_number=${phoneNumber}`, {
                method: "GET",
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.message || "Failed to check phone status",
                };
            }

            return {
                success: true,
                status: result.dnd_active ? "DND" : "Active",
                network: result.network,
            };
        } catch (error: any) {
            console.error("Termii phone status error:", error);
            return {
                success: false,
                error: error.message || "Failed to check phone status",
            };
        }
    }

    /**
     * Send bulk SMS
     */
    async sendBulkSMS(recipients: string[], message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const response = await fetch(`${TERMII_BASE_URL}/sms/send/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: this.apiKey,
                    to: recipients,
                    from: this.senderId,
                    sms: message,
                    type: "plain",
                    channel: "generic",
                }),
            });

            const result: TermiiResponse = await response.json();

            if (!response.ok || result.code !== "ok") {
                return {
                    success: false,
                    error: result.message || "Failed to send bulk SMS",
                };
            }

            return {
                success: true,
                messageId: result.message_id,
            };
        } catch (error: any) {
            console.error("Termii bulk SMS error:", error);
            return {
                success: false,
                error: error.message || "Failed to send bulk SMS",
            };
        }
    }

    /**
     * Generate OTP locally (for custom templates)
     */
    generateOTP(length: number = 6, type: "NUMERIC" | "ALPHANUMERIC" = "NUMERIC"): string {
        if (type === "NUMERIC") {
            const min = Math.pow(10, length - 1);
            const max = Math.pow(10, length) - 1;
            return Math.floor(min + Math.random() * (max - min + 1)).toString();
        } else {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    }
}

// Export singleton instance
export const termii = new TermiiService();

// Export types
export type { SendSMSOptions, SendOTPOptions, VerifyOTPOptions, OTPResponse, VerifyResponse };
