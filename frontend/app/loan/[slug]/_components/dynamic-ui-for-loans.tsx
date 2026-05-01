import React, { useState, useMemo, useEffect, Dispatch, SetStateAction } from "react";
import { StepId, Status, FormData } from "../types";
import { STEP_ORDER } from "../constants";

type CompletionStatus = {
    personalInfoComplete?: boolean;
    contactComplete?: boolean;
    bvnVerified?: boolean;
    bankDetailsProvided?: boolean;
    documentsProvided?: boolean;
    employmentComplete?: boolean;
    creditScoreRefreshed?: boolean;
};

interface DynamicUiForLoansProps {
    completionStatus: CompletionStatus;
    status: Status;
    formData: FormData;
    currentStep: StepId;
    setCurrentStep: Dispatch<SetStateAction<StepId>>;
    onStepChange: (step: StepId, direction: number) => void;
    consented: boolean;
    skipConsent: boolean;
    children: (resolvedStep: StepId) => React.ReactNode;
}

/**
 * DynamicUiForLoans handles the logic of which step the user should actually see.
 * it skips completed steps and manages the "smart" flow of the loan application.
 */
const DynamicUiForLoans = ({
    completionStatus,
    status,
    formData,
    currentStep,
    setCurrentStep,
    onStepChange,
    consented,
    skipConsent,
    children,
}: DynamicUiForLoansProps) => {
    console.log({ consented, skipConsent }, "consent states on dynamic page");
    /**
     * stepCompletionMap determines if a step is "finished" and should be skipped
     * during auto-forwarding or when finding the next step.
     * 
     * We combine server-side completionStatus and client-side status.
     */

    const stepCompletionMap: Record<StepId, boolean> = useMemo(() => ({
        // Identity steps are skipped if user confirmed their pre-filled data (consented)
        landing: consented || false,
        phone: consented || (completionStatus.personalInfoComplete || status.phoneVerified),
        email: consented || (completionStatus.personalInfoComplete || status.emailVerified),
        passcode: consented || (completionStatus.personalInfoComplete || false),
        bvn: consented || (completionStatus.bvnVerified || status.bvnVerified),

        // Core steps should NOT be skipped unless they are actually complete
        bank: !!completionStatus.bankDetailsProvided || status.bankConnected,
        offer: false,
        kyc: !!completionStatus.employmentComplete,
        terms: false,
        processing: false,
        success: false,
    }), [completionStatus, status, consented, skipConsent]);
    /**
     * resolvedStep is the "true" step the user should be on.
     * If currentStep is marked as completed, we find the first one that isn't.
     */
    const resolvedStep = useMemo(() => {
        let step = currentStep;
        console.log("STEP", step)

        const currentIndex = STEP_ORDER.indexOf(step);
        console.log("currentIndex", currentIndex)
        for (let i = currentIndex; i < STEP_ORDER.length; i++) {
            const s = STEP_ORDER[i];
            console.log(s, "STEP  IN CONSTANTS")
            if (!stepCompletionMap[s]) {
                return s;
            }
        }

        // If everything is done, show the last step
        return currentStep === 'success' ? 'success' : 'terms';
    }, [currentStep, stepCompletionMap]);

    useEffect(() => {
        if (resolvedStep !== currentStep) {
            setCurrentStep(resolvedStep);
        }
    }, [resolvedStep, currentStep, setCurrentStep]);

    return <>{children(resolvedStep)}</>;
};

export default DynamicUiForLoans;