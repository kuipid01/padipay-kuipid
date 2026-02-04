import React, { FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Loader2 } from 'lucide-react'
import { Plus, Trash2 } from 'lucide-react'
import { Banknote } from 'lucide-react'

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface BankAccountsProps {
    payoutAccounts: BankAccount[];
    addPayoutAccount: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    removePayoutAccount: (id: string) => void;
    isAddingBank: boolean;
}

export const BankAccounts = ({ payoutAccounts, addPayoutAccount, removePayoutAccount, isAddingBank }: BankAccountsProps) => {
    return (
        <Card className="border-none shadow-sm rounded-[32px]">
            <CardHeader className="p-8 pb-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black text-main-green">
                            Payout Accounts
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Bank accounts for receiving loan repayments.
                        </CardDescription>
                    </div>
                    {/* Add Bank Dialog Trigger - Simplified for now, typically would use a Dialog component */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-2xl font-bold border-gray-100 shadow-sm h-11 gap-2"
                            >
                                <Plus size={16} /> Add Bank
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80 p-4 rounded-2xl shadow-xl border-gray-100"
                            align="end"
                        >
                            <form onSubmit={addPayoutAccount} className="space-y-3">
                                <h4 className="font-bold text-main-green">
                                    Add New Account
                                </h4>
                                <Input
                                    name="bankName"
                                    placeholder="Bank Name"
                                    className="h-10 rounded-xl"
                                    required
                                />
                                <Input
                                    name="accountNumber"
                                    placeholder="Account Number"
                                    className="h-10 rounded-xl"
                                    required
                                />
                                <Input
                                    name="accountName"
                                    placeholder="Account Name"
                                    className="h-10 rounded-xl"
                                    required
                                />
                                <Button
                                    disabled={isAddingBank}
                                    className="w-full bg-lemon-primary text-main-green font-bold rounded-xl h-10"
                                >
                                    {isAddingBank ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        "Save Account"
                                    )}
                                </Button>
                            </form>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {payoutAccounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                            <Banknote size={32} />
                        </div>
                        <p className="font-black text-gray-400 mb-1">
                            No bank accounts added
                        </p>
                        <p className="text-sm text-gray-400">
                            Add a bank account to receive payouts.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payoutAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                                        {account.bankName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-main-green">
                                            {account.bankName}
                                        </p>
                                        <p className="text-xs text-gray-400 font-bold">
                                            {account.accountNumber} • {account.accountName}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                    onClick={() => removePayoutAccount(account.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
