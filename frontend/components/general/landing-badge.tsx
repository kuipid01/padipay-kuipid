import { cn } from "@/lib/utils";

interface LandingBadgeProps {
    label: string;
    text: string;
    className?: string;
}

export function LandingBadge({ label, text, className }: LandingBadgeProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-1.5 py-1.5 rounded-sm bg-lemon-primary/10 border border-lemon-primary/20 shadow-sm mb-6",
            className
        )}>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white border border-gray-100 shadow-xs">
                <div className="size-1.5 rounded-full bg-main-green" />
                <span className="text-[10px] font-black tracking-wider text-main-green uppercase">
                    {label}
                </span>
            </div>
            <span className="text-xs font-bold text-main-green pr-3">
                {text}
            </span>
        </div>
    );
}
