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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-amber-50/40 px-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-gray-200/50">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 ring-8 ring-amber-50/60">
                    <span className="text-4xl" aria-hidden="true">
                        🔒
                    </span>
                </div>

                <h2 className="mb-3 text-2xl font-bold tracking-tight text-gray-950">
                    Access Restricted
                </h2>

                <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">
                    You cannot apply to your own loan application. Please sign out and use a different account to continue.
                </p>

                <div className="mt-8 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    This helps keep loan applications fair and secure.
                </div>
            </div>
        </div>
    );
};