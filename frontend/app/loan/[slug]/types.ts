
export type StepId = 'landing' | 'phone' | 'email' | 'passcode' | 'bvn' | 'bank' | 'offer' | 'kyc' | 'terms' | 'processing' | 'success' | 'credit-score';

export interface FormData {
    phone: string;
    email: string;
    fullName: string;
    dob: string;
    passcode: string;
    otp: string;
    emailOtp: string;
    bvn: string;
    address: string;
    city: string;
    state: string;
    lga: string;
    employmentType: string;
    wagesRange: string;
    nextOfKinName: string;
    nextOfKinPhone: string;
    amount: number;
    planId: string;
    agreedToTerms: boolean;
}

export interface Status {
    phoneVerified: boolean;
    otpSent: boolean;
    emailVerified: boolean;
    emailOtpSent: boolean;
    bvnVerified: boolean;
    bankConnected: boolean;
    creditScoreRefreshed: boolean;
}
