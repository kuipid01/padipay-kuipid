import { getSession } from "@/lib/session";
import { OverviewClient } from "@/components/dashboard/overview-client";

export default async function DashboardPage() {
    const session = await getSession();
    const userId = session?.id as string;

    // We can fetch real data here and pass it as props to OverviewClient
    // For now, let's render the premium UI
    return (
        <OverviewClient />
    );
}
