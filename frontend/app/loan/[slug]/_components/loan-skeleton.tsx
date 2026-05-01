import { Skeleton } from "@/components/ui/skeleton";

export function LoanSkeleton() {
  return (
    <div className="max-w-[480px] mx-auto px-6 pt-12 pb-24 space-y-8 animate-pulse">
      {/* App Icon Skeleton */}
      <Skeleton className="size-20 rounded-[24px]" />

      <div className="space-y-4">
        {/* Title Skeleton */}
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-full rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Feature Cards Skeleton */}
        <Skeleton className="h-24 rounded-[20px]" />
        <Skeleton className="h-24 rounded-[20px]" />
      </div>

      <div className="space-y-4 pt-4">
        {/* Button Skeleton */}
        <Skeleton className="w-full h-16 rounded-[24px]" />
        <Skeleton className="w-full h-14 rounded-[24px]" />
      </div>
      
      {/* Progress Bar Placeholder */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100">
        <div className="h-full bg-gray-200 w-1/12" />
      </div>
    </div>
  );
}
