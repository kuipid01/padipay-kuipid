"use client";

import React from "react";
import { FundingStatusChecker } from "./funding-status-checker";
import { TrialStatusChecker } from "./trial-status-checker";

/**
 * A container for dashboard-wide notices and status checkers.
 * This component manages how multiple notifications stack together.
 */
export function DashboardNoticeStack() {
    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-4 pointer-events-none">
            {/* 
                We need to modify the individual checkers to NOT use 'fixed' 
                and instead participate in this flex layout if we want them to stack.
                
                However, for now, we'll keep them as they are and maybe refactor 
                them slightly if the user wants true stacking.
                
                Actually, the user said "push modals to say an array so they just be display flex flex col".
                So I will refactor the checkers to be children of this stack.
            */}
            <FundingStatusChecker inline />
            <TrialStatusChecker inline />
        </div>
    );
}
