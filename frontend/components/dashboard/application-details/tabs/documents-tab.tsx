"use client";

import { TabsContent } from "@/components/ui/tabs";
import { DocumentCard } from "../shared-components";

export function DocumentsTab() {
    return (
        <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DocumentCard
                    title="Government Issued ID"
                    type="International Passport"
                    status="Verified"
                />
                <DocumentCard
                    title="Proof of Address"
                    type="Utility Bill (Lekki)"
                    status="Verified"
                />
                <DocumentCard
                    title="Bank Statement"
                    type="Last 6 Months (GTB)"
                    status="Pending"
                />
            </div>
        </TabsContent>
    );
}
