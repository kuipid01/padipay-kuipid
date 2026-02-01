import { NavBar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="grow pt-32 pb-24">
                {children}
            </main>
            <LandingFooter />
        </div>
    );
}
