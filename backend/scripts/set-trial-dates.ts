import { db } from "../src/db";
import { users } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function setTrialDates() {
  console.log("🚀 Starting trial date update for existing users...");

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const result = await db
    .update(users)
    .set({
      trialEndsAt: thirtyDaysFromNow,
    })
    .returning({ id: users.id, email: users.email });

  console.log(`✅ Updated ${result.length} users with trial end date: ${thirtyDaysFromNow.toISOString()}`);
  
  // For new users, we will update the repository logic.
  process.exit(0);
}

setTrialDates().catch((err) => {
  console.error("❌ Error updating trial dates:", err);
  process.exit(1);
});
