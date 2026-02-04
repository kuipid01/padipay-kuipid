import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, MonitorSmartphone } from "lucide-react";
import { Button } from "../ui/button";

export const SessionsCard = () => {
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
            <SessionItem
                device="Chrome on Windows"
                location="Lagos, Nigeria"
                time="Active now"
                isCurrent
            />
            <SessionItem
                device="Safari on iPhone"
                location="Lagos, Nigeria"
                time="2 hours ago"
            />
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


