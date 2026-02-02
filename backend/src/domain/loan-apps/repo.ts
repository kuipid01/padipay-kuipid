import { db } from "../../db";
import { loanApps } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export interface CreateLoanAppInput {
  ownerId: string;
  name: string;
  slug: string;
  defaultInterestRate: string;
  defaultDurationMonths: number;
}

export interface UpdateLoanAppInput {
  name?: string;
  slug?: string;
  defaultInterestRate?: string;
  defaultDurationMonths?: number;
  isActive?: boolean;
}

/**
 * Repository layer for loan apps.
 * Contains all database operations - Drizzle queries remain unchanged.
 */
export const loanAppsRepo = {
  async findByOwner(ownerId: string) {
    return db.query.loanApps.findMany({
      where: eq(loanApps.ownerId, ownerId),
    });
  },

  async findById(id: string) {
    return db.query.loanApps.findFirst({
      where: eq(loanApps.id, id),
    });
  },

  async findByIdAndOwner(id: string, ownerId: string) {
    return db.query.loanApps.findFirst({
      where: and(
        eq(loanApps.id, id),
        eq(loanApps.ownerId, ownerId)
      ),
    });
  },

  async findBySlug(slug: string) {
    return db.query.loanApps.findFirst({
      where: eq(loanApps.slug, slug),
    });
  },

  async create(data: CreateLoanAppInput) {
    const [loanApp] = await db.insert(loanApps).values({
      ownerId: data.ownerId,
      name: data.name,
      slug: data.slug,
      defaultInterestRate: data.defaultInterestRate,
      defaultDurationMonths: data.defaultDurationMonths,
    }).returning();
    return loanApp;
  },

  async update(id: string, data: UpdateLoanAppInput) {
    const updateData: Partial<typeof loanApps.$inferInsert> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.defaultInterestRate !== undefined) {
      updateData.defaultInterestRate = data.defaultInterestRate;
    }
    if (data.defaultDurationMonths !== undefined) {
      updateData.defaultDurationMonths = data.defaultDurationMonths;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(loanApps)
      .set(updateData)
      .where(eq(loanApps.id, id))
      .returning();

    return updated;
  },

  async delete(id: string) {
    await db.delete(loanApps).where(eq(loanApps.id, id));
  },
};
