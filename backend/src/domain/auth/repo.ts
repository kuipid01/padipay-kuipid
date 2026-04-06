import { db } from "../../db";
import { users, userSessions } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { InsertUserSession } from "../../zod-schemas/user";

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName?: string;
  phone?: string;
}

/**
 * Repository layer for users.
 */
export const usersRepo = {
  async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },
  async findByPhone(phone: string) {
    return db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
  },
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },
  async saveSession(data: InsertUserSession) {
    await db.transaction(async (tx) => {
      // 1️⃣ Mark all inactive
      await tx
        .update(userSessions)
        .set({ isCurrent: false })
        .where(eq(userSessions.userId, data.userId));

      // 2️⃣ Check existing session
      const existing = await tx
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, data.userId),
            eq(userSessions.deviceFingerprint, data.deviceFingerprint),
          ),
        )
        .limit(1);

      if (existing.length) {
        // 3️⃣ Update existing
        await tx
          .update(userSessions)
          .set({
            isCurrent: true,
            lastActiveAt: new Date(),
            ipAddress: data.ipAddress,
          })
          .where(eq(userSessions.id, existing[0].id));
      } else {
        // 4️⃣ Create new
        await tx.insert(userSessions).values({
          userId: data.userId,
          deviceFingerprint: data.deviceFingerprint,
          deviceName: data.deviceName,
          browser: data.browser,
          os: data.os,
          ipAddress: data.ipAddress,
          city: data.city,
          country: data.country,
          isCurrent: true,
        });
      }
    });
  },



  async create(data: CreateUserInput) {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
      })
      .returning();
    return user;
  },

  async updateResetToken(email: string, token: string | null, expires: Date | null) {
    const [updated] = await db
      .update(users)
      .set({ resetPasswordToken: token, resetPasswordExpires: expires })
      .where(eq(users.email, email))
      .returning();
    return updated;
  },
  async updateEmailVerified(email: string, verified: boolean) {
    const [updated] = await db
      .update(users)
      .set({ emailVerified: verified })
      .where(eq(users.email, email))
      .returning();
    return updated;
  },

  async findByResetToken(token: string) {
    return db.query.users.findFirst({
      where: eq(users.resetPasswordToken, token),
    });
  },

  async updatePassword(id: string, passwordHash: string) {
    const [updated] = await db
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  },
};
