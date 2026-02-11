import { db } from "../../db";
import {
  loanApplications,
  loanApps,
  borrowers,
  repaymentPlans,
} from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { UpdateApplicationInput } from "../../zod-schemas/applications";

export const applicationsRepo = {
  async findAllByOwner(ownerId: string) {
    // 1. Get all loan app IDs owned by this user
    const userLoanApps = await db.query.loanApps.findMany({
      where: eq(loanApps.ownerId, ownerId),
      columns: { id: true },
    });

    const loanAppIds = userLoanApps.map((app) => app.id);

    if (loanAppIds.length === 0) return [];

    // 2. Find applications belonging to these loan apps
    return db.query.loanApplications.findMany({
      where: inArray(loanApplications.loanAppId, loanAppIds),
      with: {
        loanApp: true,
        borrower: true,
        repaymentPlan: true,
      },
      orderBy: (apps, { desc }) => [desc(apps.createdAt)],
    });
  },

  async findByIdAndOwner(id: string, ownerId: string) {
    const app = await db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, id),
      with: {
        loanApp: true,
        borrower: true,
        repaymentPlan: true,
      },
    });

    if (!app || app.loanApp.ownerId !== ownerId) {
      return null;
    }

    return app;
  },

  async findByIdPublic(id: string) {
    return db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, id),
      with: {
        loanApp: {
          columns: {
            name: true,
          },
        },
        borrower: {
          columns: {
            firstName: true,
            lastName: true,
          },
        },
        repaymentPlan: true,
      },
    });
  },

  async update(id: string, data: UpdateApplicationInput) {
    const [updated] = await db
      .update(loanApplications)
      .set(data)
      .where(eq(loanApplications.id, id))
      .returning();
    return updated;
  },
};
