"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { calculateRepayment } from "@/lib/utils/loan-math";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Phone,
    Mail,
    User,
    Users,
    Shield,
    FileText,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    Check,
    Smartphone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    Upload,
    Eye,
    Banknote,
    Clock,
    Percent,
    Lock
} from "lucide-react";

// Step definitions
const STEPS = [
    { id: 1, title: "Phone", icon: Phone, description: "Verify your number" },
    { id: 2, title: "Email", icon: Mail, description: "Add your email" },
    { id: 3, title: "Personal", icon: User, description: "Your details" },
    { id: 4, title: "Loan", icon: Banknote, description: "Loan amount" },
    { id: 5, title: "Guarantor", icon: Users, description: "Guarantor info" },
    { id: 6, title: "Verification", icon: Shield, description: "BVN / NIN" },
    { id: 7, title: "Documents", icon: FileText, description: "Upload docs" },
    { id: 8, title: "Review", icon: Eye, description: "Confirm & Submit" },
];

export default function PublicLoanPage() {
    const { slug } = useParams();
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Phone
        phone: "",
        phoneOtp: "",
        phoneVerified: false,
        // Step 2: Email
        email: "",
        emailOtp: "",
        emailVerified: false,
        // Step 3: Personal
        fullName: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        // Step 4: Loan
        amount: 100000,
        duration: 3,
        // Step 5: Guarantor
        guarantorName: "",
        guarantorPhone: "",
        guarantorEmail: "",
        guarantorRelationship: "",
        guarantorAddress: "",
        // Step 6: Verification
        bvn: "",
        nin: "",
        bvnVerified: false,
        ninVerified: false,
        // Step 7: Documents
        idDocument: null as File | null,
        proofOfAddress: null as File | null,
        bankStatement: null as File | null,
    });

    // OTP states
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState({ phone: false, email: false });
    const [otpCountdown, setOtpCountdown] = useState({ phone: 0, email: 0 });

    useEffect(() => {
        async function fetchApp() {
            try {
                const res = await fetch(`/api/public/${slug}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setApp(data.loanApp);
                setFormData(prev => ({
                    ...prev,
                    duration: data.loanApp.defaultDurationMonths,
                }));
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchApp();
    }, [slug]);

    // OTP countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setOtpCountdown(prev => ({
                phone: prev.phone > 0 ? prev.phone - 1 : 0,
                email: prev.email > 0 ? prev.email - 1 : 0,
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const sendOtp = async (type: "phone" | "email") => {
        setSendingOtp(true);
        try {
            const res = await fetch(`/api/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    value: type === "phone" ? formData.phone : formData.email,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setOtpSent(prev => ({ ...prev, [type]: true }));
            setOtpCountdown(prev => ({ ...prev, [type]: 60 }));
            toast.success(`OTP sent to your ${type}!`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSendingOtp(false);
        }
    };

    const verifyOtp = async (type: "phone" | "email") => {
        setVerifyingOtp(true);
        try {
            const res = await fetch(`/api/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    value: type === "phone" ? formData.phone : formData.email,
                    otp: type === "phone" ? formData.phoneOtp : formData.emailOtp,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            updateFormData(type === "phone" ? "phoneVerified" : "emailVerified", true);
            toast.success(`${type === "phone" ? "Phone" : "Email"} verified successfully!`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setVerifyingOtp(false);
        }
    };

    const verifyIdentity = async (type: "bvn" | "nin") => {
        setVerifyingOtp(true);
        try {
            const res = await fetch(`/api/verify/${type}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    [type]: formData[type],
                    phone: formData.phone,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            updateFormData(type === "bvn" ? "bvnVerified" : "ninVerified", true);
            toast.success(`${type.toUpperCase()} verified successfully!`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setVerifyingOtp(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.phoneVerified;
            case 2: return formData.email.includes("@");
            case 3: return formData.fullName && formData.dateOfBirth && formData.address;
            case 4: return formData.amount > 0 && formData.duration > 0;
            case 5: return formData.guarantorName && formData.guarantorPhone;
            case 6: return formData.bvn.length === 11 || formData.nin.length === 11;
            case 7: return true; // Documents optional for now
            case 8: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const formDataToSend = new FormData();

            // Append all text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formDataToSend.append(key, String(value));
                }
            });

            const res = await fetch(`/api/public/${slug}/apply`, {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Application failed");

            toast.success("Application submitted successfully!");

            if (data.authorizationUrl) {
                window.location.href = data.authorizationUrl;
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-main-green" />
                    <p className="font-bold text-gray-500">Loading application...</p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="size-20 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-800 mb-2">Loan App Not Found</h1>
                    <p className="text-gray-500">This loan application link may be invalid or expired.</p>
                </div>
                <Button
                    onClick={() => window.location.href = "/"}
                    className="bg-main-green text-white font-bold rounded-2xl h-12 px-8"
                >
                    Go Home
                </Button>
            </div>
        );
    }

    const { totalInterest, totalPayable, monthlyRepayment } = calculateRepayment(
        formData.amount,
        parseFloat(app.defaultInterestRate),
        formData.duration
    );

    const progressPercent = (currentStep / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-lemon-primary/5">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-main-green flex items-center justify-center text-white font-black">
                            {app.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="font-black text-main-green">{app.name}</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loan Application</p>
                        </div>
                    </div>
                    <Badge className="bg-lemon-primary text-main-green font-bold border-none">
                        {app.defaultInterestRate}% Interest
                    </Badge>
                </div>
                <Progress value={progressPercent} className="h-1 bg-gray-100" />
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Steps Sidebar */}
                    <aside className="lg:w-72 shrink-0">
                        <Card className="border-none shadow-sm rounded-[32px] sticky top-24 overflow-hidden">
                            <CardContent className="p-4">
                                <nav className="space-y-1">
                                    {STEPS.map((step, index) => {
                                        const isActive = currentStep === step.id;
                                        const isCompleted = currentStep > step.id;
                                        const Icon = step.icon;

                                        return (
                                            <div
                                                key={step.id}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                                                    isActive && "bg-lemon-primary",
                                                    isCompleted && "opacity-60"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    isActive && "bg-main-green text-white",
                                                    isCompleted && "bg-green-100 text-green-600",
                                                    !isActive && !isCompleted && "bg-gray-100 text-gray-400"
                                                )}>
                                                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "font-bold text-sm truncate",
                                                        isActive ? "text-main-green" : "text-gray-500"
                                                    )}>{step.title}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{step.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Step 1: Phone Verification */}
                        {currentStep === 1 && (
                            <StepCard
                                step={1}
                                title="Verify Your Phone Number"
                                description="We'll send you a one-time code to verify your identity."
                                icon={<Phone size={24} />}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="+234 800 000 0000"
                                                value={formData.phone}
                                                onChange={(e) => updateFormData("phone", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm text-lg font-bold"
                                                disabled={formData.phoneVerified}
                                            />
                                            {!formData.phoneVerified && (
                                                <Button
                                                    onClick={() => sendOtp("phone")}
                                                    disabled={sendingOtp || !formData.phone || otpCountdown.phone > 0}
                                                    className="h-14 px-6 rounded-2xl bg-main-green text-white font-bold shrink-0"
                                                >
                                                    {sendingOtp ? <Loader2 className="animate-spin" size={18} /> :
                                                        otpCountdown.phone > 0 ? `${otpCountdown.phone}s` : "Send OTP"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {otpSent.phone && !formData.phoneVerified && (
                                        <div className="animate-in slide-in-from-top-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Enter OTP</label>
                                            <div className="flex gap-3">
                                                <Input
                                                    placeholder="Enter 6-digit code"
                                                    value={formData.phoneOtp}
                                                    onChange={(e) => updateFormData("phoneOtp", e.target.value)}
                                                    className="h-14 rounded-2xl border-gray-100 shadow-sm text-lg font-bold tracking-[0.5em] text-center"
                                                    maxLength={6}
                                                />
                                                <Button
                                                    onClick={() => verifyOtp("phone")}
                                                    disabled={verifyingOtp || formData.phoneOtp.length !== 6}
                                                    className="h-14 px-6 rounded-2xl bg-lemon-primary text-main-green font-bold shrink-0"
                                                >
                                                    {verifyingOtp ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {formData.phoneVerified && (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                                            <CheckCircle2 className="text-green-600" size={24} />
                                            <div>
                                                <p className="font-bold text-green-700">Phone Verified</p>
                                                <p className="text-sm text-green-600">{formData.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </StepCard>
                        )}

                        {/* Step 2: Email */}
                        {currentStep === 2 && (
                            <StepCard
                                step={2}
                                title="Add Your Email Address"
                                description="We'll use this to send you loan updates and receipts."
                                icon={<Mail size={24} />}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => updateFormData("email", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm text-lg"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        <Lock size={14} className="inline mr-1" />
                                        Your email is secure and won&apos;t be shared with third parties.
                                    </p>
                                </div>
                            </StepCard>
                        )}

                        {/* Step 3: Personal Details */}
                        {currentStep === 3 && (
                            <StepCard
                                step={3}
                                title="Personal Information"
                                description="Tell us a bit about yourself."
                                icon={<User size={24} />}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Full Name (as on ID)</label>
                                        <Input
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={(e) => updateFormData("fullName", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Date of Birth</label>
                                        <Input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Residential Address</label>
                                        <Input
                                            placeholder="123 Main Street"
                                            value={formData.address}
                                            onChange={(e) => updateFormData("address", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">City</label>
                                            <Input
                                                placeholder="Lagos"
                                                value={formData.city}
                                                onChange={(e) => updateFormData("city", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">State</label>
                                            <Input
                                                placeholder="Lagos State"
                                                value={formData.state}
                                                onChange={(e) => updateFormData("state", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        {/* Step 4: Loan Details */}
                        {currentStep === 4 && (
                            <StepCard
                                step={4}
                                title="Loan Details"
                                description="How much do you need and for how long?"
                                icon={<Banknote size={24} />}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Loan Amount (₦)</label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => updateFormData("amount", Number(e.target.value))}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm text-2xl font-black"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Repayment Duration (Months)</label>
                                        <Input
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => updateFormData("duration", Number(e.target.value))}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm text-xl font-bold"
                                        />
                                    </div>

                                    {/* Quick Summary */}
                                    <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-lemon-primary/20">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly</p>
                                            <p className="text-xl font-black text-main-green">₦{monthlyRepayment.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Interest</p>
                                            <p className="text-xl font-black text-main-green">₦{totalInterest.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-xl font-black text-main-green">₦{totalPayable.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        {/* Step 5: Guarantor */}
                        {currentStep === 5 && (
                            <StepCard
                                step={5}
                                title="Guarantor Information"
                                description="Provide details of someone who can vouch for you."
                                icon={<Users size={24} />}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Guarantor&apos;s Full Name</label>
                                        <Input
                                            placeholder="Jane Smith"
                                            value={formData.guarantorName}
                                            onChange={(e) => updateFormData("guarantorName", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                                            <Input
                                                placeholder="+234 800 000 0000"
                                                value={formData.guarantorPhone}
                                                onChange={(e) => updateFormData("guarantorPhone", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="jane@example.com"
                                                value={formData.guarantorEmail}
                                                onChange={(e) => updateFormData("guarantorEmail", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Relationship</label>
                                        <Input
                                            placeholder="e.g. Colleague, Friend, Family"
                                            value={formData.guarantorRelationship}
                                            onChange={(e) => updateFormData("guarantorRelationship", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Guarantor&apos;s Address</label>
                                        <Input
                                            placeholder="456 Another Street, Lagos"
                                            value={formData.guarantorAddress}
                                            onChange={(e) => updateFormData("guarantorAddress", e.target.value)}
                                            className="h-14 rounded-2xl border-gray-100 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        {/* Step 6: Verification */}
                        {currentStep === 6 && (
                            <StepCard
                                step={6}
                                title="Identity Verification"
                                description="Verify your identity with BVN or NIN."
                                icon={<Shield size={24} />}
                            >
                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                        <p className="text-sm text-blue-700">
                                            <Lock size={14} className="inline mr-2" />
                                            Your BVN/NIN is encrypted and only used for identity verification.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Bank Verification Number (BVN)</label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="22123456789"
                                                value={formData.bvn}
                                                onChange={(e) => updateFormData("bvn", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm font-mono text-lg tracking-widest"
                                                maxLength={11}
                                                disabled={formData.bvnVerified}
                                            />
                                            {!formData.bvnVerified && formData.bvn.length === 11 && (
                                                <Button
                                                    onClick={() => verifyIdentity("bvn")}
                                                    disabled={verifyingOtp}
                                                    className="h-14 px-6 rounded-2xl bg-main-green text-white font-bold shrink-0"
                                                >
                                                    {verifyingOtp ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                        {formData.bvnVerified && (
                                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                                <CheckCircle2 size={16} /> BVN Verified
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Separator className="flex-1" />
                                        <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                                        <Separator className="flex-1" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">National Identification Number (NIN)</label>
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="12345678901"
                                                value={formData.nin}
                                                onChange={(e) => updateFormData("nin", e.target.value)}
                                                className="h-14 rounded-2xl border-gray-100 shadow-sm font-mono text-lg tracking-widest"
                                                maxLength={11}
                                                disabled={formData.ninVerified}
                                            />
                                            {!formData.ninVerified && formData.nin.length === 11 && (
                                                <Button
                                                    onClick={() => verifyIdentity("nin")}
                                                    disabled={verifyingOtp}
                                                    className="h-14 px-6 rounded-2xl bg-main-green text-white font-bold shrink-0"
                                                >
                                                    {verifyingOtp ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                        {formData.ninVerified && (
                                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                                <CheckCircle2 size={16} /> NIN Verified
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        {/* Step 7: Documents */}
                        {currentStep === 7 && (
                            <StepCard
                                step={7}
                                title="Upload Documents"
                                description="Upload supporting documents for faster approval."
                                icon={<FileText size={24} />}
                            >
                                <div className="space-y-6">
                                    <DocumentUpload
                                        label="Government ID"
                                        description="Passport, Driver's License, or National ID"
                                        file={formData.idDocument}
                                        onUpload={(file) => updateFormData("idDocument", file)}
                                    />
                                    <DocumentUpload
                                        label="Proof of Address"
                                        description="Utility bill or bank statement (not older than 3 months)"
                                        file={formData.proofOfAddress}
                                        onUpload={(file) => updateFormData("proofOfAddress", file)}
                                    />
                                    <DocumentUpload
                                        label="Bank Statement"
                                        description="Last 3-6 months bank statement"
                                        file={formData.bankStatement}
                                        onUpload={(file) => updateFormData("bankStatement", file)}
                                    />
                                </div>
                            </StepCard>
                        )}

                        {/* Step 8: Review */}
                        {currentStep === 8 && (
                            <StepCard
                                step={8}
                                title="Review & Submit"
                                description="Review your application before submitting."
                                icon={<Eye size={24} />}
                            >
                                <div className="space-y-6">
                                    <ReviewSection title="Personal Information">
                                        <ReviewItem label="Full Name" value={formData.fullName} />
                                        <ReviewItem label="Phone" value={formData.phone} verified={formData.phoneVerified} />
                                        <ReviewItem label="Email" value={formData.email} />
                                        <ReviewItem label="Address" value={`${formData.address}, ${formData.city}, ${formData.state}`} />
                                    </ReviewSection>

                                    <ReviewSection title="Loan Details">
                                        <ReviewItem label="Amount" value={`₦${formData.amount.toLocaleString()}`} />
                                        <ReviewItem label="Duration" value={`${formData.duration} months`} />
                                        <ReviewItem label="Monthly Payment" value={`₦${monthlyRepayment.toLocaleString()}`} />
                                        <ReviewItem label="Total Payable" value={`₦${totalPayable.toLocaleString()}`} />
                                    </ReviewSection>

                                    <ReviewSection title="Guarantor">
                                        <ReviewItem label="Name" value={formData.guarantorName} />
                                        <ReviewItem label="Phone" value={formData.guarantorPhone} />
                                        <ReviewItem label="Relationship" value={formData.guarantorRelationship} />
                                    </ReviewSection>

                                    <ReviewSection title="Verification">
                                        <ReviewItem label="BVN" value={formData.bvn ? `***${formData.bvn.slice(-4)}` : "Not provided"} verified={formData.bvnVerified} />
                                        <ReviewItem label="NIN" value={formData.nin ? `***${formData.nin.slice(-4)}` : "Not provided"} verified={formData.ninVerified} />
                                    </ReviewSection>

                                    <div className="p-4 rounded-2xl bg-lemon-primary/20 border border-lemon-primary/30">
                                        <p className="text-sm text-main-green">
                                            <CheckCircle2 size={16} className="inline mr-2" />
                                            By submitting, you agree to our terms and conditions and authorize automatic repayments from your card.
                                        </p>
                                    </div>
                                </div>
                            </StepCard>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className="h-14 px-8 rounded-2xl font-bold border-gray-100 gap-2"
                            >
                                <ArrowLeft size={18} /> Back
                            </Button>

                            {currentStep < STEPS.length ? (
                                <Button
                                    onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
                                    disabled={!canProceed()}
                                    className="h-14 px-8 rounded-2xl bg-main-green text-white font-bold gap-2"
                                >
                                    Continue <ArrowRight size={18} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="h-14 px-8 rounded-2xl bg-lemon-primary text-main-green font-black gap-2 shadow-lg shadow-lemon-primary/30"
                                >
                                    {submitting ? (
                                        <><Loader2 className="animate-spin" size={18} /> Submitting...</>
                                    ) : (
                                        <>Submit Application <CheckCircle2 size={18} /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    </main>

                    {/* Summary Sidebar (Desktop) */}
                    <aside className="hidden xl:block w-80 shrink-0">
                        <Card className="border-none shadow-sm rounded-[32px] sticky top-24 overflow-hidden bg-gradient-to-br from-main-green to-main-green/90 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-black">Loan Summary</CardTitle>
                                <CardDescription className="text-white/60">
                                    {app.defaultInterestRate}% interest rate
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center py-4">
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Monthly Payment</p>
                                    <p className="text-4xl font-black">₦{monthlyRepayment.toLocaleString()}</p>
                                </div>

                                <Separator className="bg-white/20" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Principal</span>
                                        <span className="font-bold">₦{formData.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Interest</span>
                                        <span className="font-bold">₦{totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Duration</span>
                                        <span className="font-bold">{formData.duration} months</span>
                                    </div>
                                </div>

                                <Separator className="bg-white/20" />

                                <div className="flex justify-between font-black">
                                    <span>Total Payable</span>
                                    <span>₦{totalPayable.toLocaleString()}</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/10">
                                    <p className="text-xs text-white/80">
                                        <CreditCard size={14} className="inline mr-2" />
                                        Auto-debit from your card on the 1st of each month.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}

// =============================================
// SUB-COMPONENTS
// =============================================

function StepCard({ step, title, description, icon, children }: { step: number; title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="border-none shadow-sm rounded-[32px]">
            <CardHeader className="p-8 pb-0">
                <div className="flex items-center gap-4 mb-2">
                    <div className="size-14 rounded-2xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                        {icon}
                    </div>
                    <div>
                        <Badge className="bg-gray-100 text-gray-500 font-bold border-none text-[10px] mb-1">Step {step} of 8</Badge>
                        <CardTitle className="text-2xl font-black text-main-green">{title}</CardTitle>
                    </div>
                </div>
                <CardDescription className="text-gray-500 ml-[72px]">{description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
                {children}
            </CardContent>
        </Card>
    );
}

function DocumentUpload({ label, description, file, onUpload }: { label: string; description: string; file: File | null; onUpload: (file: File) => void }) {
    return (
        <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-main-green/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                    {file ? <CheckCircle2 className="text-green-500" size={24} /> : <Upload size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-main-green">{label}</p>
                    <p className="text-xs text-gray-400">{file ? file.name : description}</p>
                </div>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                    />
                    <Button variant="outline" className="rounded-xl font-bold border-gray-100 h-10" type="button" asChild>
                        <span>{file ? "Change" : "Upload"}</span>
                    </Button>
                </label>
            </div>
        </div>
    );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</h4>
            <div className="space-y-2 p-4 rounded-2xl bg-gray-50/50">
                {children}
            </div>
        </div>
    );
}

function ReviewItem({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-bold text-main-green">{value}</span>
                {verified && <CheckCircle2 className="text-green-500" size={14} />}
            </div>
        </div>
    );
}
