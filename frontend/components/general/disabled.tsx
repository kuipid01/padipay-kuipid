'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '../../hooks/use-user';
import { toast } from 'sonner';

interface AccountDisabledWrapperProps {
    children: React.ReactNode;
}

export const AccountDisabledWrapper = ({ children }: AccountDisabledWrapperProps) => {
    const { data } = useUser();
    const router = useRouter();

    const [showOverlay, setShowOverlay] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setShowOverlay(!!data?.disabledAt);
    }, [data?.disabledAt]);

    if (!showOverlay) return <>{children}</>;

    const handleEnableAccount = async () => {
        if (!password) {
            setError('Password is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/account/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || data.error);
            }
            toast.success('Account enabled successfully, welcome back!!');
            setShowOverlay(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to enable account');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    return (
        <div className="relative">
            {children}

            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                aria-modal
                role="dialog"
            >
                <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in-95">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>

                        <CardTitle className="text-xl font-semibold">
                            Account temporarily disabled
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                            For your security, this account is disabled. Enter your password
                            to restore access.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEnableAccount();
                                }}
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                        <Button
                            className="w-full text-black"
                            onClick={handleEnableAccount}
                            disabled={loading || !password}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Re-enabling…
                                </>
                            ) : (
                                'Re-enable account'
                            )}
                        </Button>

                        <Button
                            variant="link"
                            className="text-sm text-muted-foreground"
                            onClick={handleForgotPassword}
                            disabled={loading}
                        >
                            Forgot password?
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
