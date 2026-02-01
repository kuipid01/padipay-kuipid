import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export default async function NotificationsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.sentAt)],
    });

    const notificationsData = userNotifications.map(notif => ({
        ...notif,
        sentAt: notif.sentAt?.toISOString() || new Date().toISOString(),
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-main-green tracking-tight">Notifications</h1>
                <p className="text-gray-500 font-medium">View all automated messages sent to you and your borrowers.</p>
            </div>

            <NotificationsList initialNotifications={notificationsData} />
        </div>
    );
}
