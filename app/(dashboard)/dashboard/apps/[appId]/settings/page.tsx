import { db } from "@/db";
import { loanApps } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { AppSettingsForm } from "@/components/dashboard/app-settings-form";

interface AppSettingsPageProps {
    params: Promise<{ appId: string }>;
}

export default async function AppSettingsPage({ params }: AppSettingsPageProps) {
    const { appId } = await params;
    const session = await getSession();
    const userId = session?.id as string;

    const app = await db.query.loanApps.findFirst({
        where: and(
            eq(loanApps.id, appId),
            eq(loanApps.ownerId, userId)
        ),
    });

    if (!app) {
        notFound();
    }

    const appData = {
        ...app,
        defaultInterestRate: app.defaultInterestRate.toString(),
        createdAt: app.createdAt?.toISOString() || new Date().toISOString(),
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">App Settings</h1>
                <p className="text-gray-500 font-medium">Configure settings for <span className="font-black text-main-green">{app.name}</span></p>
            </div>

            <AppSettingsForm app={appData} />
        </div>
    );
}
