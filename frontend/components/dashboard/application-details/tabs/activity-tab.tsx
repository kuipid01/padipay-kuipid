"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Application } from "../types";
import { ActivityItem } from "../shared-components";

interface ActivityTabProps {
    application: Application;
}

export function ActivityTab({ application }: ActivityTabProps) {
    return (
        <TabsContent value="activity" className="mt-0">
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardContent className="p-8">
                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
                        <ActivityItem
                            title="Application Submitted"
                            time={format(
                                new Date(application.createdAt),
                                "MMM d, yyyy h:mm a",
                            )}
                            desc="Borrower completed the loan request form."
                        />
                        <ActivityItem
                            title="Documents Verified"
                            time="Just now"
                            desc="System automatically verified ID and Proof of Address."
                        />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
}
