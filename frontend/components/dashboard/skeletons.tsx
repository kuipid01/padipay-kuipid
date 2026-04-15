"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="border-none shadow-sm rounded-[24px]">
                    <CardContent className="p-6 flex flex-col justify-between h-[140px]">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-3 w-24 rounded-full" />
                            <Skeleton className="size-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-full mb-3" />
                        <Skeleton className="h-5 w-32 rounded-full mt-auto" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function AppCardsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {/* Search and filter bar skeleton */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <Skeleton className="h-12 w-full md:w-96 rounded-2xl" />
                <div className="flex gap-2 w-full md:w-auto">
                    <Skeleton className="h-12 w-28 rounded-2xl" />
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[32px]">
                        <CardHeader className="p-6 pb-0">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="size-12 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="size-8 rounded-xl" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center justify-between mt-2">
                                <Skeleton className="h-7 w-20 rounded-full" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="flex-1 h-11 rounded-2xl" />
                                <Skeleton className="size-11 rounded-2xl" />
                                <Skeleton className="size-11 rounded-2xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <Card className="border-none shadow-sm rounded-[32px]">
            <CardContent className="p-8">
                {/* Search/Filter Bar Skeleton */}
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                    <Skeleton className="h-12 w-full md:w-96 rounded-2xl" />
                    <Skeleton className="h-12 w-full md:w-32 rounded-2xl" />
                </div>
                
                <div className="space-y-6">
                    {/* Table Header */}
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        {Array.from({ length: columns }).map((_, i) => (
                            <Skeleton key={i} className={`h-4 ${i === 0 ? "w-32" : "w-24"} rounded-full`} />
                        ))}
                    </div>
                    {/* Table Rows */}
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                            {Array.from({ length: columns }).map((_, j) => (
                                <Skeleton key={j} className={`h-4 ${j === 0 ? "w-32" : "w-24"} rounded-full`} />
                            ))}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
