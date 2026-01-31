"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateRepayment } from "@/lib/utils/loan-math";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PublicLoanPage() {
    const { slug } = useParams();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [amount, setAmount] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    // Borrower details
    const [borrower, setBorrower] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        async function fetchApp() {
            try {
                const res = await fetch(`/api/public/${slug}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setApp(data.loanApp);
                setAmount(100000); // Default principal
                setDuration(data.loanApp.defaultDurationMonths);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchApp();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!app) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-bold">Loan App Not Found</h1>
                <Button onClick={() => window.location.href = "/"}>Go Home</Button>
            </div>
        );
    }

    const { totalInterest, totalPayable, monthlyRepayment } = calculateRepayment(
        amount,
        parseFloat(app.defaultInterestRate),
        duration
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!borrower.fullName || !borrower.email || !borrower.phone) {
            toast.error("Please fill in all personal details.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/public/${slug}/apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...borrower,
                    amount,
                    durationMonths: duration,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Application failed");
            }

            toast.success("Redirecting to finalize card authorization...");

            // Redirect to Paystack checkouts
            if (data.authorizationUrl) {
                window.location.href = data.authorizationUrl;
            }
        } catch (err: any) {
            toast.error(err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 shadow-inner">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Form */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                        <p className="text-muted-foreground">Fill in the details below to apply for a loan.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={borrower.fullName}
                                    onChange={(e) => setBorrower({ ...borrower, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={borrower.email}
                                        onChange={(e) => setBorrower({ ...borrower, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="08012345678"
                                        value={borrower.phone}
                                        onChange={(e) => setBorrower({ ...borrower, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Loan Amount (₦)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Months)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 text-lg">
                                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Apply for Loan"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Loan Summary / Preview */}
                <div className="lg:sticky lg:top-12 h-fit">
                    <Card className="bg-primary text-primary-foreground border-none overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl">Repayment Summary</CardTitle>
                            <CardDescription className="text-primary-foreground/70">
                                Interest Rate: {app.defaultInterestRate}%
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex justify-between items-end border-b border-primary-foreground/20 pb-4">
                                <span className="text-sm opacity-80">Monthly Repayment</span>
                                <span className="text-3xl font-bold">₦{monthlyRepayment.toLocaleString()}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Principal</span>
                                    <span>₦{amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Total Interest</span>
                                    <span>₦{totalInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-2 border-t border-primary-foreground/20">
                                    <span>Total Payable</span>
                                    <span>₦{totalPayable.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 flex gap-3">
                                <CheckCircle2 className="shrink-0 text-white" />
                                <p className="text-xs leading-relaxed">
                                    Automatic repayments will be charged monthly from your card until the loan is fully repaid.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
