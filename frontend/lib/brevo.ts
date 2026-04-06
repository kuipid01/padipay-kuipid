/**
 * Brevo (formerly Sendinblue) API Integration
 * Used for transactional emails
 * Documentation: https://developers.brevo.com/
 */

const BREVO_BASE_URL = "https://api.brevo.com/v3";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const DEFAULT_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "noreply@MyCashNG.com";
const DEFAULT_SENDER_NAME = process.env.BREVO_SENDER_NAME || "MyCashNG";

interface EmailRecipient {
    email: string;
    name?: string;
}

interface SendEmailOptions {
    to: EmailRecipient[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: number;
    params?: Record<string, any>;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    replyTo?: EmailRecipient;
    attachments?: Array<{
        name: string;
        content: string; // Base64 encoded
        contentType?: string;
    }>;
    tags?: string[];
}

interface EmailTemplateParams {
    [key: string]: any;
}

interface BrevoResponse {
    messageId?: string;
    error?: {
        code: string;
        message: string;
    };
}

interface ContactOptions {
    email: string;
    attributes?: Record<string, any>;
    listIds?: number[];
    updateEnabled?: boolean;
}

class BrevoService {
    private headers: HeadersInit;
    private senderEmail: string;
    private senderName: string;

    constructor() {
        this.headers = {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
        };
        this.senderEmail = DEFAULT_SENDER_EMAIL;
        this.senderName = DEFAULT_SENDER_NAME;
    }

    /**
     * Send a transactional email
     */
    async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const payload: any = {
                sender: {
                    email: this.senderEmail,
                    name: this.senderName,
                },
                to: options.to,
                subject: options.subject,
            };

            if (options.templateId) {
                payload.templateId = options.templateId;
                if (options.params) {
                    payload.params = options.params;
                }
            } else {
                if (options.htmlContent) payload.htmlContent = options.htmlContent;
                if (options.textContent) payload.textContent = options.textContent;
            }

            if (options.cc) payload.cc = options.cc;
            if (options.bcc) payload.bcc = options.bcc;
            if (options.replyTo) payload.replyTo = options.replyTo;
            if (options.attachments) payload.attachment = options.attachments;
            if (options.tags) payload.tags = options.tags;

            const response = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(payload),
            });

            const result: BrevoResponse = await response.json();

            if (!response.ok || result.error) {
                return {
                    success: false,
                    error: result.error?.message || "Failed to send email",
                };
            }

            return {
                success: true,
                messageId: result.messageId,
            };
        } catch (error: any) {
            console.error("Brevo email error:", error);
            return {
                success: false,
                error: error.message || "Failed to send email",
            };
        }
    }

    /**
     * Send OTP verification email
     */
    async sendOTPEmail(email: string, otp: string, name?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, #194d1c 0%, #2d7a32 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MyCashNG</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Lending Partner</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #194d1c; margin: 0 0 20px 0; font-size: 24px;">Verification Code</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi${name ? ` ${name}` : ''},<br><br>
                            Your verification code is:
                        </p>
                        <div style="background: #f0f9f1; border: 2px dashed #194d1c; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #194d1c;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                            This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                        </p>
                        <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
                            If you didn't request this code, please ignore this email or contact our support team.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} MyCashNG. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: `${otp} is your MyCashNG verification code`,
            htmlContent,
            tags: ["otp", "verification"],
        });
    }

    /**
     * Send loan application confirmation email
     */
    async sendApplicationConfirmation(
        email: string,
        name: string,
        loanAmount: number,
        duration: number,
        applicationId: string
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, #194d1c 0%, #2d7a32 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MyCashNG</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="font-size: 30px;">✓</span>
                            </div>
                        </div>
                        <h2 style="color: #194d1c; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Application Received!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            We've received your loan application and it's now being reviewed. Here are the details:
                        </p>
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Application ID</td>
                                    <td style="padding: 10px 0; color: #194d1c; font-weight: bold; text-align: right;">#${applicationId.slice(0, 8).toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">Loan Amount</td>
                                    <td style="padding: 10px 0; color: #194d1c; font-weight: bold; text-align: right; border-top: 1px solid #eee;">₦${loanAmount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">Duration</td>
                                    <td style="padding: 10px 0; color: #194d1c; font-weight: bold; text-align: right; border-top: 1px solid #eee;">${duration} months</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">Status</td>
                                    <td style="padding: 10px 0; text-align: right; border-top: 1px solid #eee;">
                                        <span style="background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">PENDING REVIEW</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                            We'll notify you once your application has been reviewed. This typically takes 1-2 business days.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} MyCashNG. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: `Your Loan Application #${applicationId.slice(0, 8).toUpperCase()} Received`,
            htmlContent,
            tags: ["application", "confirmation"],
        });
    }

    /**
     * Send loan approval email
     */
    async sendApprovalEmail(
        email: string,
        name: string,
        loanAmount: number,
        monthlyPayment: number,
        startDate: string
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, #194d1c 0%, #2d7a32 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #194d1c; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Your Loan is Approved!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            Great news! Your loan application has been approved. The funds will be disbursed shortly.
                        </p>
                        <div style="background: #e8f5e9; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Approved Amount</p>
                            <p style="color: #194d1c; font-size: 36px; font-weight: bold; margin: 0;">₦${loanAmount.toLocaleString()}</p>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Monthly Payment</td>
                                    <td style="padding: 10px 0; color: #194d1c; font-weight: bold; text-align: right;">₦${monthlyPayment.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">First Payment Date</td>
                                    <td style="padding: 10px 0; color: #194d1c; font-weight: bold; text-align: right; border-top: 1px solid #eee;">${startDate}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                            Your card will be automatically charged on the 1st of each month. Make sure to maintain sufficient balance.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} MyCashNG. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: `🎉 Your Loan of ₦${loanAmount.toLocaleString()} is Approved!`,
            htmlContent,
            tags: ["approval", "loan"],
        });
    }

    /**
     * Send payment reminder email
     */
    async sendPaymentReminder(
        email: string,
        name: string,
        amount: number,
        dueDate: string
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, #194d1c 0%, #2d7a32 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Reminder</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            This is a friendly reminder that your loan repayment is coming up.
                        </p>
                        <div style="background: #fff3cd; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <p style="color: #856404; font-size: 14px; margin: 0 0 10px 0;">Amount Due</p>
                            <p style="color: #856404; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">₦${amount.toLocaleString()}</p>
                            <p style="color: #856404; font-size: 14px; margin: 0;">Due: ${dueDate}</p>
                        </div>
                        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                            Please ensure your card has sufficient funds. The payment will be automatically deducted on the due date.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} MyCashNG. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: `Payment Reminder: ₦${amount.toLocaleString()} due ${dueDate}`,
            htmlContent,
            tags: ["reminder", "payment"],
        });
    }

    /**
     * Add or update a contact in Brevo
     */
    async upsertContact(options: ContactOptions): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${BREVO_BASE_URL}/contacts`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify({
                    email: options.email,
                    attributes: options.attributes || {},
                    listIds: options.listIds || [],
                    updateEnabled: options.updateEnabled !== false,
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                return {
                    success: false,
                    error: result.message || "Failed to create contact",
                };
            }

            return { success: true };
        } catch (error: any) {
            console.error("Brevo contact error:", error);
            return {
                success: false,
                error: error.message || "Failed to create contact",
            };
        }
    }

    /**
     * Generate OTP for email verification
     */
    generateOTP(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
}

// Export singleton instance
export const brevo = new BrevoService();

// Export types
export type { SendEmailOptions, EmailRecipient, ContactOptions };
