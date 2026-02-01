import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ appId: string }>;
}

// GET - Fetch a single loan app
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { appId } = await params;
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const app = await db.query.loanApps.findFirst({
            where: and(
                eq(loanApps.id, appId),
                eq(loanApps.ownerId, session.id)
            ),
        });

        if (!app) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        return NextResponse.json({ app });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update a loan app
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { appId } = await params;
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Verify ownership
        const existingApp = await db.query.loanApps.findFirst({
            where: and(
                eq(loanApps.id, appId),
                eq(loanApps.ownerId, session.id)
            ),
        });

        if (!existingApp) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        // If slug is being changed, check for uniqueness
        if (body.slug && body.slug !== existingApp.slug) {
            const slugExists = await db.query.loanApps.findFirst({
                where: eq(loanApps.slug, body.slug),
            });
            if (slugExists) {
                return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
            }
        }

        // Build update object
        const updateData: Partial<typeof loanApps.$inferInsert> = {};
        
        if (body.name !== undefined) updateData.name = body.name;
        if (body.slug !== undefined) updateData.slug = body.slug;
        if (body.defaultInterestRate !== undefined) updateData.defaultInterestRate = body.defaultInterestRate.toString();
        if (body.defaultDurationMonths !== undefined) updateData.defaultDurationMonths = body.defaultDurationMonths;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        const [updatedApp] = await db
            .update(loanApps)
            .set(updateData)
            .where(eq(loanApps.id, appId))
            .returning();

        return NextResponse.json({ app: updatedApp });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete a loan app
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { appId } = await params;
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const existingApp = await db.query.loanApps.findFirst({
            where: and(
                eq(loanApps.id, appId),
                eq(loanApps.ownerId, session.id)
            ),
        });

        if (!existingApp) {
            return NextResponse.json({ error: "App not found" }, { status: 404 });
        }

        await db
            .delete(loanApps)
            .where(eq(loanApps.id, appId));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
