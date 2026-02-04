import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, Loader2, MonitorSmartphone } from "lucide-react";
import { Button } from "../ui/button";
import { useGetUserSessions } from "../../hooks/user/sessions";

export const SessionsCard = () => {
    const { userSessions, isLoading } = useGetUserSessions()
    return <Card className="border-none shadow-sm rounded-[32px]">
        <CardHeader className="p-8 pb-0">
            <CardTitle className="text-lg font-black text-main-green">
                Active Sessions
            </CardTitle>
            <CardDescription className="text-gray-500">
                Devices currently logged into your account.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
            {isLoading ? <div className="flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div> : userSessions?.map((session) => (
                <SessionItem
                    key={session.id}
                    device={session.deviceName}
                    location={`${session.city}, ${session.country}`}
                    time={session.lastActiveAt}
                    isCurrent={session.isCurrent}
                />
            ))}
        </CardContent>
    </Card>
}






function SessionItem({
    device,
    location,
    time,
    isCurrent,
}: {
    device: string;
    location: string;
    time: string;
    isCurrent?: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 text-gray-400">
                    <MonitorSmartphone size={18} />
                </div>
                <div>
                    <p className="font-bold text-main-green">{device}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {location} • {time}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isCurrent && (
                    <Badge className="bg-green-50 text-green-600 font-bold border-none text-[9px] uppercase">
                        Current
                    </Badge>
                )}
                {!isCurrent && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 font-bold"
                    >
                        Revoke
                    </Button>
                )}
            </div>
        </div>
    );
}


