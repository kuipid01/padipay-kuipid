import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Shield, Smartphone } from 'lucide-react'

export const TwoFA = ({ updateSettings }: { updateSettings: (data: any) => void }) => {
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [isUpdating2FA, setIsUpdating2FA] = useState(false);
    return (
        <Card className="border-none shadow-sm rounded-[32px]">
            <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-main-green">
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Add an extra layer of security to your account.
                            </CardDescription>
                        </div>
                    </div>
                    {isTwoFactorEnabled ? (
                        <Badge className="bg-green-50 text-green-600 font-bold border-none text-[10px] uppercase tracking-widest">
                            Enabled
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-50 text-orange-600 font-bold border-none text-[10px] uppercase tracking-widest">
                            Not Enabled
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <Button
                    disabled={isUpdating2FA}
                    onClick={() => {
                        setIsUpdating2FA(true);
                        setIsTwoFactorEnabled(!isTwoFactorEnabled);
                        updateSettings({
                            isTwoFactorEnabled: !isTwoFactorEnabled,
                        });
                        setIsUpdating2FA(false);
                    }}
                    variant="outline"
                    className={cn("rounded-2xl font-bold border-gray-100 shadow-sm h-12 gap-2", isTwoFactorEnabled ? "bg-green-600 text-white" : "bg-orange-600 text-white")}
                >
                    <Shield size={18} />{isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
            </CardContent>
        </Card>
    )
}
