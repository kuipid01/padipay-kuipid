import React from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface PaystacIntProps {
    isSaving: boolean
    showSecretKey: boolean
    setShowSecretKey: React.Dispatch<React.SetStateAction<boolean>>
    paystackForm: UseFormReturn<{
        paystackPublicKey?: string | undefined;
        paystackSecretKey?: string | undefined;
    }, any, {
        paystackPublicKey?: string | undefined;
        paystackSecretKey?: string | undefined;
    }>
    onPaystackSubmit: (values: {
        paystackPublicKey?: string | undefined;
        paystackSecretKey?: string | undefined;
    }) => Promise<void>
}

export const PaystackInt = ({ isSaving, showSecretKey, setShowSecretKey, paystackForm, onPaystackSubmit }: PaystacIntProps) => {

    return (
        <Form {...paystackForm}>
            <form onSubmit={paystackForm.handleSubmit(onPaystackSubmit)}>
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                                    P
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-main-green">
                                        Paystack Integration
                                    </CardTitle>
                                    <CardDescription className="text-gray-500">
                                        Connect your Paystack account to receive payments.
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge className="bg-green-50 text-green-600 font-bold border-none text-[10px] uppercase tracking-widest">
                                Connected
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <FormField
                            control={paystackForm.control}
                            name="paystackPublicKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Public Key
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="pk_test_..."
                                            className="h-12 rounded-2xl border-gray-100 shadow-sm font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-gray-400">
                                        Used for frontend payment initialization.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={paystackForm.control}
                            name="paystackSecretKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Secret Key
                                    </FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showSecretKey ? "text" : "password"}
                                                placeholder="sk_test_..."
                                                className="h-12 rounded-2xl border-gray-100 shadow-sm font-mono text-sm pr-12"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                                            onClick={() =>
                                                setShowSecretKey(!showSecretKey)}
                                        >
                                            {showSecretKey ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </Button>
                                    </div>
                                    <FormDescription className="text-xs text-gray-400">
                                        Keep this secret! Used for backend transactions.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <Badge className="bg-blue-100 text-blue-600 font-bold border-none text-[10px] uppercase">
                                Test Mode
                            </Badge>
                            <span className="text-sm text-blue-700 font-medium">
                                Switch to Live Mode in production.
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-12 px-8 rounded-2xl shadow-lg shadow-lemon-primary/20"
                        >
                            {isSaving && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Keys
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
