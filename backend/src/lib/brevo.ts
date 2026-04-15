/**
 * Brevo (formerly Sendinblue) API Integration
 * Used for transactional emails
 * Documentation: https://developers.brevo.com/
 */

const BREVO_BASE_URL = "https://api.brevo.com/v3";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const DEFAULT_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "padiloan@kuipid.com";
const DEFAULT_SENDER_NAME = process.env.BREVO_SENDER_NAME || "padiloan";

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
    params?: Record<string, unknown>;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    replyTo?: EmailRecipient;
    attachments?: Array<{
        name: string;
        content: string;
        contentType?: string;
    }>;
    tags?: string[];
}

interface BrevoResponse {
    messageId?: string;
    code?: string;
    message?: string;
}

interface ContactOptions {
    email: string;
    attributes?: Record<string, unknown>;
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

    async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const payload: Record<string, unknown> = {
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

            if (!response.ok) {
                console.error("Brevo API Error:", result);
                return { 
                    success: false, 
                    error: result.message || `Brevo error (${response.status}): ${response.statusText}` 
                };
            }

            return { success: true, messageId: result.messageId };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to send email";
            console.error("Brevo email error:", error);
            return { success: false, error: message };
        }
    }


    async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="background: linear-gradient(135deg, #1F4941 0%, #2a6156 100%); padding: 50px 40px; border-radius: 24px 24px 0 0; text-align: center;">
                        <h1 style="color: #BDF49D; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">mycashng</h1>
                        <p style="color: rgba(189, 244, 157, 0.8); margin: 10px 0 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Secure Finance Access</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 24px 24px; box-shadow: 0 10px 25px -5px rgba(31, 73, 65, 0.1);">
                        <h2 style="color: #1F4941; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Reset Your Password</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name || 'there'},<br><br>
                            We received a request to reset your password for your <strong>mycashng</strong> account. No worries, it happens! Click the button below to choose a new password:
                        </p>
                        <div style="text-align: center; margin-bottom: 35px;">
                            <a href="${resetLink}" style="background-color: #1F4941; color: #BDF49D; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(31, 73, 65, 0.2);">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                            This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain the same.
                        </p>
                        <div style="border-top: 1px solid #f1f5f9; padding-top: 25px; margin-top: 25px;">
                            <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                                If you're having trouble clicking the button, copy and paste this URL into your web browser:
                                <br>
                                <span style="word-break: break-all; color: #1F4941; text-decoration: underline;">${resetLink}</span>
                            </p>
                        </div>
                    </div>
                    <div style="text-align: center; padding: 30px 20px;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} mycashng. Smart solutions for your financial growth.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: "Reset your mycashng password",
            htmlContent,
            tags: ["auth", "forgot-password"],
        });
    }

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
                    <div style="background: linear-gradient(135deg, #1F4941 0%, #2a6156 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: #BDF49D; margin: 0; font-size: 28px; font-weight: bold;">mycashng</h1>
                        <p style="color: rgba(189, 244, 157, 0.8); margin: 10px 0 0 0; font-size: 14px;">Your Trusted Lending Partner</p>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #1F4941; margin: 0 0 20px 0; font-size: 24px;">Verification Code</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi${name ? ` ${name}` : ''},<br><br>
                            Your verification code is:
                        </p>
                        <div style="background: #f0f9f1; border: 2px dashed #1F4941; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1F4941;">${otp}</span>
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
                            © ${new Date().getFullYear()} mycashng. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: [{ email, name }],
            subject: `${otp} is your mycashng verification code`,
            htmlContent,
            tags: ["otp", "verification"],
        });
    }

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
                    <div style="background: linear-gradient(135deg, #1F4941 0%, #2a6156 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: #BDF49D; margin: 0; font-size: 28px; font-weight: bold;">mycashng</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="font-size: 30px; color: #1F4941;">✓</span>
                            </div>
                        </div>
                        <h2 style="color: #1F4941; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Application Received!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            We've received your loan application and it's now being reviewed.
                        </p>
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Application ID</td>
                                    <td style="padding: 10px 0; color: #1F4941; font-weight: bold; text-align: right;">#${applicationId.slice(0, 8).toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">Loan Amount</td>
                                    <td style="padding: 10px 0; color: #1F4941; font-weight: bold; text-align: right; border-top: 1px solid #eee;">₦${loanAmount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">Duration</td>
                                    <td style="padding: 10px 0; color: #1F4941; font-weight: bold; text-align: right; border-top: 1px solid #eee;">${duration} months</td>
                                </tr>
                            </table>
                        </div>
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
                    <div style="background: linear-gradient(135deg, #1F4941 0%, #2a6156 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: #BDF49D; margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #1F4941; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Your Loan is Approved!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            Great news! Your loan application has been approved by <strong>mycashng</strong>.
                        </p>
                        <div style="background: #e8f5e9; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Approved Amount</p>
                            <p style="color: #1F4941; font-size: 36px; font-weight: bold; margin: 0;">₦${loanAmount.toLocaleString()}</p>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px;">Monthly Payment</td>
                                    <td style="padding: 10px 0; color: #1F4941; font-weight: bold; text-align: right;">₦${monthlyPayment.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666; font-size: 14px; border-top: 1px solid #eee;">First Payment Date</td>
                                    <td style="padding: 10px 0; color: #1F4941; font-weight: bold; text-align: right; border-top: 1px solid #eee;">${startDate}</td>
                                </tr>
                            </table>
                        </div>
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
async sendVerificationEmail (email:string,name:string,token:string)  {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
   console.log(verificationUrl,"VERIFICATION URL")
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email Verification</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #333;">Email Verification</h1>
                    <p style="color: #666;">Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email</a>
                </div>
            </div>
        </body>
        </html>
    `;
    return this.sendEmail({
        to: [{ email, name }],
        subject: "Email Verification",
        htmlContent,
        tags: ["verification", "email"],
    });
  }

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
                    <div style="background: linear-gradient(135deg, #1F4941 0%, #2a6156 100%); padding: 40px; border-radius: 20px 20px 0 0; text-align: center;">
                        <h1 style="color: #BDF49D; margin: 0; font-size: 28px; font-weight: bold;">Payment Reminder</h1>
                    </div>
                    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Hi ${name},<br><br>
                            This is a friendly reminder from <strong>mycashng</strong> that your loan repayment is coming up.
                        </p>
                        <div style="background: #fff3cd; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                            <p style="color: #856404; font-size: 14px; margin: 0 0 10px 0;">Amount Due</p>
                            <p style="color: #856404; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">₦${amount.toLocaleString()}</p>
                            <p style="color: #856404; font-size: 14px; margin: 0;">Due: ${dueDate}</p>
                        </div>
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
                return { success: false, error: result.message || "Failed to create contact" };
            }

            return { success: true };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to create contact";
            console.error("Brevo contact error:", error);
            return { success: false, error: message };
        }
    }

    generateOTP(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
}

export const brevo = new BrevoService();
export type { SendEmailOptions, EmailRecipient, ContactOptions };
