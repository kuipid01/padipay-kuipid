import { Loader2 } from "lucide-react";

export function SuspenseLoader() {
    return (
        <div className="flex items-center justify-center min-h-[200px] w-full">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-main-green" />
                <p className="text-sm text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}
