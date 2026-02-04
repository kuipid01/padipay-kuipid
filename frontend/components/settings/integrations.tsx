import React, { ReactNode } from 'react'
import { Zap, Webhook, MonitorSmartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { SectionHeader } from './section-header'

export const IntegrationsSection = () => {
    return (
        <div className="space-y-8">
            <SectionHeader
                icon={<Zap size={24} />}
                title="Integrations"
                description="Connect third-party services to enhance your workflow."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntegrationCard
                    name="Paystack"
                    description="Payment processing"
                    status="connected"
                    logo="P"
                    color="bg-blue-50 text-blue-600"
                />
                <IntegrationCard
                    name="BVN Verification"
                    description="Identity verification"
                    status="not_connected"
                    logo="BVN"
                    color="bg-green-50 text-green-600"
                />
                <IntegrationCard
                    name="Termii"
                    description="SMS notifications"
                    status="not_connected"
                    logo="T"
                    color="bg-purple-50 text-purple-600"
                />
                <IntegrationCard
                    name="Webhooks"
                    description="Event notifications"
                    status="not_connected"
                    logo={<Webhook size={20} />}
                    color="bg-orange-50 text-orange-600"
                />
            </div>
        </div>
    )
}



function IntegrationCard({
    name,
    description,
    status,
    logo,
    color,
}: {
    name: string;
    description: string;
    status: "connected" | "not_connected";
    logo: ReactNode;
    color: string;
}) {
    return (
        <Card className="border-none shadow-sm rounded-[32px] hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
                <div
                    className={cn(
                        "size-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                        color,
                    )}
                >
                    {logo}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-main-green">{name}</p>
                    <p className="text-xs text-gray-400 font-medium">{description}</p>
                </div>
                {status === "connected" ? (
                    <Badge className="bg-green-50 text-green-600 font-bold border-none text-[9px] uppercase tracking-widest">
                        Connected
                    </Badge>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold border-gray-100 shadow-sm"
                    >
                        Connect
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}