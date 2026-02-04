import React from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { UseFormReturn } from 'react-hook-form'

interface PasswordCardProps {
    securityForm: UseFormReturn<{
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }, any, {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>;
    onSecuritySubmit: any;
    isChangingPassword: boolean;
}

export const PasswordCard = ({ securityForm, onSecuritySubmit, isChangingPassword }: PasswordCardProps) => {
    return (
        <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black text-main-green">
                                    Password
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Update your password regularly for security.
                                </CardDescription>
                            </div>
                            <Badge className="bg-green-50 text-green-600 font-bold border-none text-[10px] uppercase tracking-widest">
                                Strong
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <FormField
                            control={securityForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Current Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={securityForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            New Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={securityForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Confirm Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">
                            Last updated: 30 days ago
                        </p>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isChangingPassword}
                            className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-12 px-8 rounded-2xl shadow-lg shadow-lemon-primary/20"
                        >
                            {isChangingPassword && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Update Password
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
