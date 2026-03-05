"use client";

import { TabsContent } from "@/components/ui/tabs";
import { DocumentCard } from "../shared-components";
import { useFetch } from "@/hooks/general";
import { Loader2, FileText } from "lucide-react";

interface DocumentsTabProps {
    borrowerId: string;
}

const DEFAULT_DOC_TYPES = [
    { type: "GOVERNMENT_ID", title: "Government Issued ID" },
    { type: "PROOF_OF_ADDRESS", title: "Proof of Address" },
    { type: "BANK_STATEMENT", title: "Bank Statement" },
    { type: "UTILITY_BILL", title: "Utility Bill" },
    { type: "EMPLOYMENT_LETTER", title: "Employment Letter" },
];

export function DocumentsTab({ borrowerId }: DocumentsTabProps) {
    const { data: documents, isLoading } = useFetch<any[]>(
        `/api/borrower/${borrowerId}/documents`,
        { key: `borrower-${borrowerId}-documents`, }
    );
    console.log(documents, "fdoucmen")
    if (isLoading) {
        return (
            <TabsContent value="documents" className="mt-0">
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm border-dashed">
                    <Loader2 className="animate-spin text-main-green" size={32} />
                    <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Fetching documents...</p>
                </div>
            </TabsContent>
        );
    }

    const formatStatus = (status: string) => {
        if (!status) return "Not Uploaded";
        const s = status.toUpperCase();
        if (s === "VERIFIED") return "Verified";
        if (s === "PENDING") return "Pending";
        if (s === "REJECTED") return "Rejected";
        return status;
    };

    return (
        <TabsContent value="documents" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEFAULT_DOC_TYPES.map((docDef) => {
                    const doc = documents?.find((d) => d.type === docDef.type);
                    return (
                        <DocumentCard
                            key={docDef.type}
                            title={docDef.title}
                            type={docDef?.type?.replace(/_/g, " ")}
                            status={formatStatus(doc?.status)}
                            url={doc?.url}
                        />
                    );
                })}

                {/* Dynamically show extra docs that are not in the default list */}
                {documents?.filter(d => !DEFAULT_DOC_TYPES.some(rd => rd.type === d.type)).map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        title={doc.name || "Additional Document"}
                        type={doc?.type?.replace(/_/g, " ")}
                        status={formatStatus(doc.status)}
                        url={doc.url}
                    />
                ))}
            </div>

            {(!documents || documents.length === 0) && (
                <div className="mt-8 flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-[32px] text-gray-400 italic bg-gray-50/50">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No documents uploaded yet by this borrower.</p>
                </div>
            )}
        </TabsContent>
    );
}
