import React from 'react';
import { getAuthStatus, getBorrower, getBorrowerCompletionMap } from '../../../lib/loan-app-auth';
import { BorrowerProvider } from '../../../lib/borrower-context';
import { ClientGate } from './_components/client-gate';

const Layout = async ({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ slug: string }>
}>) => {

    const { slug } = await params
    const { authStatus } = await getAuthStatus(slug)

    // 🔹 Logged in but not owner → show restricted UI
    if (authStatus.loanAppOwnedByLoggedInUser) {
        return <UserOwnsLoanUI />;
    }

    let borrowerData = null;
    if (authStatus.isBorrower && authStatus.isLoggedIn) {
        const res = await getBorrower()
        borrowerData = res.user
    }

    const data = borrowerData ? {
        borrower: borrowerData,
        completion: await getBorrowerCompletionMap(borrowerData)
    } : null;

    return (
        <div className="min-h-screen bg-transparent">
            <BorrowerProvider value={data}>
                <ClientGate borrowerData={borrowerData}>
                    {children}
                </ClientGate>
            </BorrowerProvider>
        </div>
    )
}

export default Layout



const UserOwnsLoanUI = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-xl font-semibold">
                This loan application is yours
            </h2>
            <p className="text-gray-500 mt-2">
                You don’t have permission to view this loan.
            </p>
        </div>
    );
}; 