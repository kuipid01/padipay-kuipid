/**
 * Paystack API Integration
 * Handles payment initialization and verification
 */

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export class PaystackService {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.PAYSTACK_SECRET_KEY || "";
    
    if (!this.secretKey) {
      throw new Error("Paystack secret key is required");
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(params: {
    email: string;
    amount: number; // in kobo (smallest currency unit)
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<PaystackInitializeResponse> {
    console.log(this.secretKey)
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    });
console.log(response)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to initialize payment");
    }

    return response.json();
  }

  /**
   * Verify a payment transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to verify payment");
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(payload)
      .digest("hex");
    
    return hash === signature;
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
