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
        console.log(res.user, "THIS IS THE BORROWER DATA")
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
        <UserOwnsLoanUI />
    );
}; 