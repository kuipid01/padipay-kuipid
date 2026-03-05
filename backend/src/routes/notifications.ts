import { Hono } from "hono";
import { db } from "../db";
import { notificationLogs, loans, repayments, borrowers } from "../db/schema";
import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import { authMiddleware, borrowerAuthMiddleware } from "../middleware/auth";

const router = new Hono();

// Helper to format results
const formatStats = (stats: any) => ({
    totalSent: Number(stats?.totalSent || 0),
    emails: Number(stats?.emails || 0),
    sms: Number(stats?.sms || 0),
    thisWeek: Number(stats?.thisWeek || 0)
});

// ─────────────────────────────────────────────────────────────────────────────
// LENDER NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/notifications/lender/summary
 * Summary for Lenders (about notifications sent to their borrowers)
 */
router.get("/lender/summary", authMiddleware, async (c) => {
    const user = c.get("user");
    
    // Find all loans managed by this lender
    const lenderLoans = await db.select({ id: loans.id }).from(loans).where(eq(loans.lenderId, user.id));
    const loanIds = lenderLoans.map(l => l.id);
    
    if (loanIds.length === 0) {
        return c.json({ totalSent: 0, emails: 0, sms: 0, thisWeek: 0 });
    }
    
    // Find all repayments for these loans
    const lenderRepayments = await db.select({ id: repayments.id }).from(repayments).where(inArray(repayments.loanId, loanIds));
    const repaymentIds = lenderRepayments.map(r => r.id);
    
    if (repaymentIds.length === 0) {
        return c.json({ totalSent: 0, emails: 0, sms: 0, thisWeek: 0 });
    }

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [stats] = await db.select({
        totalSent: count(),
        emails: sql<number>`count(*) filter (where ${notificationLogs.channel} = 'EMAIL')`,
        sms: sql<number>`count(*) filter (where ${notificationLogs.channel} = 'SMS')`,
        thisWeek: sql<number>`count(*) filter (where ${notificationLogs.createdAt} >= ${lastWeek.toISOString()})`
    })
    .from(notificationLogs)
    .where(and(
        inArray(notificationLogs.repaymentId, repaymentIds),
        eq(notificationLogs.status, 'SENT')
    ));

    return c.json(formatStats(stats));
});

/**
 * GET /api/notifications/lender/history
 * List of notifications sent to lender's borrowers
 */
router.get("/lender/history", authMiddleware, async (c) => {
    const user = c.get("user");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const channel = c.req.query("channel"); 
    const status = c.req.query("status");   
    const offset = (page - 1) * limit;

    const lenderLoans = await db.select({ id: loans.id }).from(loans).where(eq(loans.lenderId, user.id));
    const loanIds = lenderLoans.map(l => l.id);
    if (loanIds.length === 0) return c.json({ data: [], meta: { page, limit, total: 0 } });
    
    const lenderRepayments = await db.select({ id: repayments.id }).from(repayments).where(inArray(repayments.loanId, loanIds));
    const repaymentIds = lenderRepayments.map(r => r.id);
    if (repaymentIds.length === 0) return c.json({ data: [], meta: { page, limit, total: 0 } });

    const filters = [inArray(notificationLogs.repaymentId, repaymentIds)];
    if (channel) filters.push(eq(notificationLogs.channel, channel));
    if (status) filters.push(eq(notificationLogs.status, status));
    
    const whereClause = and(...filters);
    
    const [totalCount] = await db.select({ value: count() }).from(notificationLogs).where(whereClause);
    
    const data = await db.query.notificationLogs.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: desc(notificationLogs.createdAt),
        with: {
            borrower: true,
            repayment: {
                with: {
                    loan: {
                        with: {
                            borrower: true
                        }
                    }
                }
            }
        }
    });

    return c.json({
        data,
        meta: {
            page,
            limit,
            total: Number(totalCount?.value || 0)
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// BORROWER NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/notifications/borrower/summary
 * Summary for Borrowers (about notifications they received)
 */
router.get("/borrower/summary", borrowerAuthMiddleware, async (c) => {
    const user = c.get("user"); // user.id is borrowerId here
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [stats] = await db.select({
        totalSent: count(),
        emails: sql<number>`count(*) filter (where ${notificationLogs.channel} = 'EMAIL')`,
        sms: sql<number>`count(*) filter (where ${notificationLogs.channel} = 'SMS')`,
        thisWeek: sql<number>`count(*) filter (where ${notificationLogs.createdAt} >= ${lastWeek.toISOString()})`
    })
    .from(notificationLogs)
    .where(and(
        eq(notificationLogs.borrowerId, user.id),
        eq(notificationLogs.status, 'SENT')
    ));

    return c.json({
        totalReceived: Number(stats?.totalSent || 0),
        emails: Number(stats?.emails || 0),
        sms: Number(stats?.sms || 0),
        thisWeek: Number(stats?.thisWeek || 0)
    });
});

/**
 * GET /api/notifications/borrower/history
 * List of notifications a borrower received
 */
router.get("/borrower/history", borrowerAuthMiddleware, async (c) => {
    const user = c.get("user");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const channel = c.req.query("channel");
    const offset = (page - 1) * limit;

    const filters = [eq(notificationLogs.borrowerId, user.id)];
    if (channel) filters.push(eq(notificationLogs.channel, channel));
    
    const whereClause = and(...filters);
    
    const [totalCount] = await db.select({ value: count() }).from(notificationLogs).where(whereClause);
    
    const data = await db.query.notificationLogs.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: desc(notificationLogs.createdAt),
        with: {
            repayment: {
                with: {
                    loan: true
                }
            }
        }
    });

    return c.json({
        data,
        meta: {
            page,
            limit,
            total: Number(totalCount?.value || 0)
        }
    });
});

export default router;
