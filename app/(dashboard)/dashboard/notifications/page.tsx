import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MessageSquare } from "lucide-react";

export default async function NotificationsPage() {
    const session = await getSession();
    const userId = session?.id as string;

    const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.sentAt)],
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
                <p className="text-muted-foreground">View all automated messages sent to you or your borrowers.</p>
            </div>

            <div className="space-y-4">
                {userNotifications.length === 0 ? (
                    <Card className="p-12 text-center text-muted-foreground">
                        No notifications sent yet.
                    </Card>
                ) : (
                    userNotifications.map((notif) => (
                        <Card key={notif.id} className="overflow-hidden">
                            <div className="flex">
                                <div className={`w-1 ${notif.type === "EMAIL" ? "bg-blue-500" : "bg-green-500"}`} />
                                <CardContent className="flex-1 p-4 flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-muted text-muted-foreground">
                                        {notif.type === "EMAIL" ? <Mail size={18} /> : <MessageSquare size={18} />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-[10px]">{notif.type}</Badge>
                                            <span className="text-xs text-muted-foreground">{format(new Date(notif.sentAt!), "MMM d, h:mm a")}</span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">{notif.message}</p>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
