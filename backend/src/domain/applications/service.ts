import { applicationsRepo } from "./repo";
import { UpdateApplicationInput } from "../../zod-schemas/applications";
import { db } from "../../db";
import { loans, repayments, loanApplications, auditLogs, users } from "../../db/schema";
import { applicationEventsQueue } from "../../lib/redis";
import { eq } from "drizzle-orm";
import { generateRepaymentSchedule } from "../../utils/loan-math";

import { ServiceError, ServiceResult } from "../../lib/types";

export const applicationsService = {
  async getAll(ownerId: string): Promise<ServiceResult<Awaited<ReturnType<typeof applicationsRepo.findAllByOwner>>>> {
    const apps = await applicationsRepo.findAllByOwner(ownerId);
    return { success: true, data: apps };
  },

  async getPublicStatus(id: string): Promise<ServiceResult<any>> {
    const app = await applicationsRepo.findByIdPublic(id);

    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    return { success: true, data: app };
  },

  async getById(id: string, ownerId: string): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof applicationsRepo.findByIdAndOwner>>>>> {
    const app = await applicationsRepo.findByIdAndOwner(id, ownerId);

    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    return { success: true, data: app };
  },

  async update(id: string, ownerId: string, data: UpdateApplicationInput): Promise<ServiceResult<any>> {
    const app = await applicationsRepo.findByIdAndOwner(id, ownerId);
    console.log("GOT HERE")
    if (!app) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    // Intercept APPROVED status updates from PATCH route
    if (data.status === "APPROVED") {
      return this.approve(id, ownerId);
    }

    const updated = await applicationsRepo.update(id, data);
    return { success: true, data: updated };
  },

  async approve(id: string, lenderId: string): Promise<ServiceResult<any>> {
    const application = await applicationsRepo.findByIdAndOwner(id, lenderId);

    if (!application) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    if (application.status !== "PENDING") {
      return { success: false, error: { code: 400, message: "Application already processed" } };
    }

    try {
      const result = await db.transaction(async (tx) => {
        // 1. Calculate totals
        const principal = Number.parseFloat(application.amount.toString());
        const interestRate = application.repaymentPlan.interestRate;
        const duration = application.durationMonths;
        const totalInterest = (principal * interestRate) / 100;
        const totalPayable = principal + totalInterest;

        // 2. Create Loan
        const [loan] = await tx.insert(loans).values({
          applicationId: application.id,
          lenderId: lenderId,
          borrowerId: application.borrowerId,
          principal: application.amount,
          interest: totalInterest.toFixed(2),
          totalPayable: totalPayable.toFixed(2),
          status: "ACTIVE",
        }).returning();

        // 3. Generate Repayments
        const schedule = generateRepaymentSchedule(principal, interestRate, duration, new Date());

        for (const item of schedule) {
          await tx.insert(repayments).values({
            loanId: loan.id,
            amount: item.amount.toFixed(2),
            dueDate: item.dueDate,
            status: "PENDING",
          });
        }

        // 4. Update Application Status
        await tx.update(loanApplications)
          .set({ status: "APPROVED" })
          .where(eq(loanApplications.id, application.id));

        // 5. Insert audit log
        await tx.insert(auditLogs).values({
          applicationId: application.id,
          action: "APPROVED",
          actorId: lenderId,
        });

        return { loan, repayments: schedule };
      });

      // Record funding request to DB for internal tracking
      await db.insert(auditLogs).values({
        applicationId: application.id,
        action: "FUNDING_REQUESTED",
        actorId: lenderId,
        metadata: {
          borrowerName: `${application.borrower.firstName} ${application.borrower.lastName}`,
          amountFormatted: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(application.amount)),
          adminEmail: process.env.ADMIN_EMAIL || "kuipid01@gmail.com"
        }
      });

      // Dispatch to Queue for internal admin handling (temporary until automated)
      await applicationEventsQueue.add("funding_requested", {
        applicationId: application.id,
        category: "FUNDING_REQUESTED",
        channels: ["EMAIL"],
        payload: {
          userName: application.borrower.firstName || "Customer",
          amountFormatted: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(application.amount)),
          email: process.env.ADMIN_EMAIL || "kuipid01@gmail.com",
          link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/apps/${application.id}`
        }
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("Approve loan error:", error);
      return { success: false, error: { code: 500, message: "Failed to approve loan" } };
    }
  },

  async fund(id: string, lenderId: string): Promise<ServiceResult<any>> {
    const application = await applicationsRepo.findByIdAndOwner(id, lenderId);

    if (!application) {
      return { success: false, error: { code: 404, message: "Application not found" } };
    }

    if (application.status !== "APPROVED") {
      return { success: false, error: { code: 400, message: "Application must be APPROVED before funding" } };
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Update Application Status
        await tx.update(loanApplications)
          .set({ status: "FUNDED" })
          .where(eq(loanApplications.id, application.id));

        // Insert audit log
        await tx.insert(auditLogs).values({
          applicationId: application.id,
          action: "FUNDED",
          actorId: lenderId,
        });

        return { funded: true };
      });

      // Dispatch to Queue
      await applicationEventsQueue.add("funds_disbursed", {
        applicationId: application.id,
        category: "FUNDS_DISBURSED",
        channels: ["EMAIL"],
        payload: {
          userName: application.borrower.firstName || "Customer",
          amountFormatted: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(application.amount)),
          email: application.borrower.email,
          link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/loans/${application.id}`
        }
      });

      return { success: true, data: result };
    } catch (error) {
      console.error("Fund loan error:", error);
      return { success: false, error: { code: 500, message: "Failed to fund loan" } };
    }
  }
};
