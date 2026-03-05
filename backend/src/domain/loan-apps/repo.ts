import { db } from "../../db";
import { loanApps, repaymentPlans, loanApplications, loans } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { CreateLoanAppInput,  } from "./types";
import { UpdateLoanAppInput } from "../../zod-schemas/loan-apps";




export const loanAppsRepo = {
  // Includes repayment plans in the result
  async findByOwner(ownerId: string) {
    return db.query.loanApps.findMany({
      where: eq(loanApps.ownerId, ownerId),
      with: { repaymentPlans: true },
    });
  },

  async findByIdAndOwner (id: string, ownerId: string) {
    return db.query.loanApps.findFirst({
      where: and(eq(loanApps.id, id), eq(loanApps.ownerId, ownerId)),
      with: { repaymentPlans: true , applications:true},
    });
  },
  async getPublicById(id: string) {
    return db.query.loanApps.findFirst({
      where: eq(loanApps.id, id),
      with: { repaymentPlans: true },
    });
  },
  async findById(id: string, ownerId: string) {
    return db.query.loanApps.findFirst({
      where: and(eq(loanApps.id, id), eq(loanApps.ownerId, ownerId)),
      with: { repaymentPlans: true },
    });
  },
async update(id:string,data:UpdateLoanAppInput){
  return db.update(loanApps).set(data).where(eq(loanApps.id, id)).returning();
},
  async findBySlug(slug: string) {
    return db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
      with: { repaymentPlans: true },
    });
  },

  /**
   * Creates a Loan App and its associated Repayment Plans in one transaction
   */
  async create(data: CreateLoanAppInput) {
    return await db.transaction(async (tx) => {
      // 1. Insert the App
      const [newApp] = await tx.insert(loanApps).values({
        ownerId: data.ownerId,
        name: data.name,
        slug: data.slug,
        minLoanAmount: data.minLoanAmount,
        maxLoanAmount: data.maxLoanAmount,
        allowCustomAmounts: data.allowCustomAmounts,
        requireCreditCheck: data.requireCreditCheck,
        collectionStrategy: data.collectionStrategy,
      }).returning();

      // 2. Insert the Plans linked to the new App ID
      if (data.repaymentPlans.length > 0) {
        await tx.insert(repaymentPlans).values(
          data.repaymentPlans.map((plan) => ({
            ...plan,
            loanAppId: newApp.id,
          }))
        );
      }

      return newApp;
    });
  },

  async delete(id: string) {
    // Note: If you set onDelete: "cascade" in schema, plans delete automatically
    await db.delete(loanApps).where(eq(loanApps.id, id));
  },

  async getAnalyticsData(loanAppId: string) {
    const apps = await db.query.loanApplications.findMany({
      where: eq(loanApplications.loanAppId, loanAppId),
    });

    const loanIdsQuery = sql`(SELECT id FROM ${loanApplications} WHERE loan_app_id = ${loanAppId})`;
    
    const loanRecords = await db.query.loans.findMany({
      where: sql`application_id IN ${loanIdsQuery}`,
    });

    const repaymentsRecords = await db.query.repayments.findMany({
      where: sql`loan_id IN (SELECT id FROM ${loans} WHERE application_id IN ${loanIdsQuery})`,
      with: { subRepayments: true }
    });
    
    return {
      apps,
      loans: loanRecords,
      repayments: repaymentsRecords
    };
  }
};