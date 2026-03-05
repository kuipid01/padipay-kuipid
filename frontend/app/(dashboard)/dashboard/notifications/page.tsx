import { NotificationsList } from "@/components/dashboard/notifications-list";

export default function NotificationsPage() {
    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-20">
            <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-main-green/5 text-main-green text-[10px] font-black uppercase tracking-widest w-fit">
                    Activity Logs
                </div>
                <h1 className="text-5xl font-black text-main-green tracking-tight">Notification History</h1>
                <p className="text-gray-500 font-medium text-lg max-w-2xl">
                    Track all automated messages sent to your borrowers via EMAIL and SMS channels including payment reminders and confirmation alerts.
                </p>
            </div>

            <NotificationsList />
        </div>
    );
}

