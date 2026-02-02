import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

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

  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async create(data: CreateUserInput) {
    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone,
    }).returning();
    return user;
  },

  async updateResetToken(email: string, token: string, expires: Date) {
    const [updated] = await db
      .update(users)
      .set({ resetPasswordToken: token, resetPasswordExpires: expires })
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
        resetPasswordExpires: null 
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  },
};
