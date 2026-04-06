"use client";

import React from 'react';
import { BorrowerProfileStatus } from '@/components/borrower/borrower-profile-status';
import { Borrower } from '@/hooks/use-user';
import { ConsentProvider, useConsent } from '@/lib/consent-context';

export const ClientGate = ({ children, borrowerData }: { children: React.ReactNode, borrowerData: Borrower | null }) => {
    return (
        <ConsentProvider>
            <GateLogic borrowerData={borrowerData}>
                {children}
            </GateLogic>
        </ConsentProvider>
    );
};

const GateLogic = ({ children, borrowerData }: { children: React.ReactNode, borrowerData: Borrower | null }) => {
    const { consented, setConsented, skipConsent, setSkipConsent } = useConsent();

    // 🚫 Block everything on CLIENT if borrower is logged in but hasn't consented and hasn't skipped
    if (borrowerData && !consented && !skipConsent) {
        return (
            <div className="pt-8 pb-4">
                <BorrowerProfileStatus
                    borrower={borrowerData}
                    onConsent={(consent: boolean) => {
                        console.log(consent, "consent token")
                        if (consent) {
                            setConsented(true);
                        } else {
                            setSkipConsent(true);
                        }
                    }}
                />
            </div>
        );
    }

    return <>{children}</>;
};
