import { Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#FDFDFD]">
            <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-main-green/20" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 bg-main-green rounded-xl animate-pulse" />
                </div>
            </div>
            <p className="font-black text-main-green/40 uppercase tracking-[0.2em] text-xs">Kuipid Secure</p>
        </div>
    );
}
