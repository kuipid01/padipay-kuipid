import { db } from "../../db";
import { repaymentPlans } from "../../db/schema";
import { eq } from "drizzle-orm";
import { CreateRepaymentPlanInput } from "../../zod-schemas/repayment-plans";




export const repaymentPlansRepo = {
  async findByAppId(loanAppId: string) {
    return db.query.repaymentPlans.findMany({
      where: eq(repaymentPlans.loanAppId, loanAppId),
    });
  },

  async findById(id: string) {
    return db.query.repaymentPlans.findFirst({
      where: eq(repaymentPlans.id, id),
    });
  },

  async findByIdWithOwner(id: string) {
    return db.query.repaymentPlans.findFirst({
      where: eq(repaymentPlans.id, id),
      with: {
        loanApp: true,
      },
    });
  },

  async update(id: string, data: Partial<CreateRepaymentPlanInput>) {
    const [updated] = await db
      .update(repaymentPlans)
      .set(data)
      .where(eq(repaymentPlans.id, id))
      .returning();
    return updated;
  },

  async addPlanToApp(loanAppId: string, data: CreateRepaymentPlanInput) {
    const [newPlan] = await db.insert(repaymentPlans).values({
      ...data,
      loanAppId,
    }).returning();
    return newPlan;
  },

  async delete(id: string) {
    await db.delete(repaymentPlans).where(eq(repaymentPlans.id, id));
  }
};