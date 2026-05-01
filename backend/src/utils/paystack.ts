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
    metadata: any;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    amount: number;
    currency: string;
    reference: string;
    source: string;
    reason: string;
    status: string;
    transfer_code: string;
    createdAt: string;
    updatedAt: string;
  };
}

export class PaystackService {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.PAYSTACK_SECRET_KEY || "";

    if (!this.secretKey) {
      console.warn("Paystack secret key is missing");
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(params: {
    email: string;
    amount: number; // in kobo (smallest currency unit)
    reference?: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<PaystackInitializeResponse> {
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
        callback_url: params.callback_url,
        metadata: params.metadata,
      }),
    });

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
   * Charge a customer using a saved authorization code
   */
  async chargeAuthorization(params: {
    email: string;
    amount: number; // in kobo
    authorization_code: string;
    reference?: string;
    metadata?: any;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction/charge_authorization`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        authorization_code: params.authorization_code,
        reference: params.reference,
        metadata: params.metadata,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to charge authorization");
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

  /**
   * Create a Transfer Recipient
   */
  async createTransferRecipient(params: {
    type: "nuban" | "ghipss" | "mobile_money" | "basa" | string;
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
    description?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message: string;
    data: {
      recipient_code: string;
      active: boolean;
      id: number;
      name: string;
      type: string;
      details: {
        account_number: string;
        account_name: string;
        bank_code: string;
        bank_name: string;
      };
      currency: string
    };
  }> {
    const response = await fetch(`${this.baseUrl}/transferrecipient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: params.type || "nuban",
        name: params.name,
        account_number: params.account_number,
        bank_code: params.bank_code,
        currency: params.currency || "NGN",
        description: params.description,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to create transfer recipient");
    }

    return response.json();
  }

  /**
   * Initiate a Transfer
   */
  async initiateTransfer(params: {
    source?: string;
    amount: number; // in kobo/pesewas
    recipient: string; // recipient code
    reference: string;
    reason?: string;
    currency?: string;
  }): Promise<PaystackTransferResponse> {
    const response = await fetch(`${this.baseUrl}/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: params.source || "balance",
        amount: params.amount,
        recipient: params.recipient,
        reference: params.reference,
        reason: params.reason,
        currency: params.currency || "NGN",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to initiate transfer");
    }

    return response.json();
  }

  /**
   * Finalize an initiated transfer
   */
  async finalizeTransfer(params: {
    transfer_code: string;
    otp: string;
  }): Promise<PaystackTransferResponse> {
    const response = await fetch(`${this.baseUrl}/transfer/finalize_transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to finalize transfer");
    }

    return response.json();
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
