"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Application } from "./types";

interface ApplicationHeaderProps {
    application: Application;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white shadow-sm border border-gray-100 h-12 w-12"
                asChild
            >
                <Link href="/dashboard/applications">
                    <ArrowLeft size={20} className="text-main-green" />
                </Link>
            </Button>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-black text-main-green tracking-tight">
                        Review Application
                    </h1>
                    <Badge
                        variant="outline"
                        className="text-[10px] font-black uppercase tracking-widest border-gray-200 text-gray-400"
                    >
                        ID: {application.id.split("-")[0]}
                    </Badge>
                </div>
                <p className="text-gray-500 font-medium">
                    Review signals and decide on this loan request.
                </p>
            </div>
        </div>
    );
}
