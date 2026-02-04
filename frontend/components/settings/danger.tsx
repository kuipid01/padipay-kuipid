import React, { useState } from 'react'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { SectionHeader } from './section-header'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'

export const DangerZone = ({ updateSetting }: { updateSetting: (values: any) => Promise<boolean> }) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogAction, setDialogAction] = useState<string | null>(null)
    const [dialogTitle, setDialogTitle] = useState('')
    const [dialogDescription, setDialogDescription] = useState('')

    const openDialog = (action: string, title: string, description: string) => {
        setDialogAction(action)
        setDialogTitle(title)
        setDialogDescription(description)
        setDialogOpen(true)
    }

    const handleConfirm = async () => {
        let result: boolean = false;

        // Perform the action based on dialogAction
        switch (dialogAction) {
            case 'disable-account':
                result = await updateSetting({ disabledAt: new Date() })
                break
            case 'revoke-keys':
                console.log('Revoking all API keys...')
                // Add your revoke keys logic here
                result = true; // Placeholder
                break
            case 'delete-account':
                result = await updateSetting({
                    deletionRequestedAt: new Date(),
                    deletedAt: new Date()
                })
                break
            default:
                break
        }

        if (result) {
            setDialogOpen(false)
            setDialogAction(null)
        }
    }

    const handleCancel = () => {
        setDialogOpen(false)
        setDialogAction(null)
    }

    return (
        <div className="space-y-8">
            <SectionHeader
                icon={<AlertTriangle size={24} />}
                title="Danger Zone"
                description="Irreversible actions. Proceed with caution."
            />

            <Card className="border-2 border-red-100 shadow-sm rounded-[32px] bg-red-50/30">
                <CardContent className="p-8 space-y-6">
                    <DangerItem
                        title="Disable Account"
                        description="Temporarily disable your account. You can re-enable it later."
                        buttonLabel="Disable"
                        variant="outline"
                        onClick={() => openDialog(
                            'disable-account',
                            'Disable Account?',
                            'Are you sure you want to temporarily disable your account? You will need to contact support to re-enable it.'
                        )}
                    />
                    {/* <Separator className="bg-red-100" />
                    <DangerItem
                        title="Revoke All API Keys"
                        description="Invalidate all active API keys immediately."
                        buttonLabel="Revoke Keys"
                        variant="outline"
                        onClick={() => openDialog(
                            'revoke-keys',
                            'Revoke All API Keys?',
                            'This action will immediately invalidate all your active API keys. Any applications using these keys will stop working until you generate new ones.'
                        )}
                    /> */}
                    <Separator className="bg-red-100" />
                    <DangerItem
                        title="Delete Account"
                        description="Permanently delete your account and all associated data. This cannot be undone."
                        buttonLabel="Delete Account"
                        variant="destructive"
                        onClick={() => openDialog(
                            'delete-account',
                            'Delete Account Permanently?',
                            'This action is irreversible! All your data, including loan applications and settings, will be permanently deleted and cannot be recovered.'
                        )}
                    />
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            {dialogTitle}
                        </DialogTitle>
                        <DialogDescription className="text-red-600">
                            {dialogDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl font-bold"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="rounded-2xl font-bold"
                            onClick={handleConfirm}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

type DangerItemProps = {
    title: string;
    description: string;
    buttonLabel: string;
    variant: "outline" | "destructive";
    onClick: () => void;
};

function DangerItem({
    title,
    description,
    buttonLabel,
    variant,
    onClick
}: DangerItemProps) {
    return (
        <div className="flex items-center justify-between gap-6">
            <div>
                <p className="font-black text-red-700">{title}</p>
                <p className="text-sm text-red-600/70 font-medium">{description}</p>
            </div>
            <Button
                variant={variant === "destructive" ? "destructive" : "outline"}
                className={cn(
                    "rounded-2xl font-bold h-11 px-6 shrink-0",
                    variant === "outline" &&
                    "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
                )}
                onClick={onClick}
            >
                {buttonLabel}
            </Button>
        </div>
    );
}