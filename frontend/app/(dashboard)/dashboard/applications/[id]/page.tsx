import { db } from "@/db";
import { loanApplications } from "@/db/schema";
import { getSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ApplicationDetails } from "@/components/dashboard/application-details";

interface ApplicationPageProps {
    params: {
        id: string;
    };
}

export default async function ApplicationDetailPage({ params }: ApplicationPageProps) {
    const session = await getSession();
    const userId = session?.id as string;

    const { id } = await params;

    const application = await db.query.loanApplications.findFirst({
        where: eq(loanApplications.id, id),
        with: {
            loanApp: true,
            borrower: true,
        },
    });

    if (!application) {
        notFound();
    }

    // Security check: Ensure the user owns the loan app
    if (application.loanApp.ownerId !== userId) {
        notFound();
    }

    return (
        <ApplicationDetails application={application} />
    );
}
