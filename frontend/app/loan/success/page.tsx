import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoanSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-2xl shadow-xl">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-green-100">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Application Received!</h1>
                    <p className="text-muted-foreground">
                        Your card has been authorized successfully. The lender will review your application and you&apos;ll be notified via email once it&apos;s approved.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    );
}
