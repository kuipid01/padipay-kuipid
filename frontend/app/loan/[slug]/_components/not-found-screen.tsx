import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[#FDFDFD] space-y-8">
            <div className="size-24 rounded-[32px] bg-red-50 flex items-center justify-center text-red-500">
                <AlertCircle size={48} />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-black">Application Not Found</h1>
                <p className="text-gray-500 leading-relaxed">This loan application link might be expired or invalid. Please check the URL and try again.</p>
            </div>
            <Button
                onClick={() => window.location.href = '/'}
                className="h-14 px-8 rounded-[20px] bg-main-green text-white font-bold"
            >
                Return to Home
            </Button>
        </div>
    );
}
