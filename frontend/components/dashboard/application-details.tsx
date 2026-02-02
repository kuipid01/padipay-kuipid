"use client";

import { useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Wallet,
    ShieldCheck,
    FileText,
    History,
    MessageSquare,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Download,
    Eye,
    ChevronRight,
    Loader2,
    DollarSign,
    TrendingUp,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ApplicationDetailsProps {
    application: any;
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [isApproveLoading, setIsApproveLoading] = useState(false);

    // Mock risk data
    const riskScore = 82;
    const riskLevel = "Low";

    return (
        <div className="space-y-8 pb-32 relative">
            {/* Header / Back Link */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-gray-100 h-12 w-12" asChild>
                    <Link href="/dashboard/applications">
                        <ArrowLeft size={20} className="text-main-green" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-main-green tracking-tight">Review Application</h1>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-gray-200 text-gray-400">
                            ID: {application.id.split('-')[0]}
                        </Badge>
                    </div>
                    <p className="text-gray-500 font-medium">Review signals and decide on this loan request.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="bg-white p-2 rounded-[32px] shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
                            <TabsList className="bg-transparent h-14 w-full justify-start gap-1">
                                <TabTrigger value="overview" icon={<Eye size={16} />} label="Overview" />
                                <TabTrigger value="financial" icon={<Wallet size={16} />} label="Financial Details" />
                                <TabTrigger value="documents" icon={<FileText size={16} />} label="Documents" />
                                <TabTrigger value="repayment" icon={<ShieldCheck size={16} />} label="Repayment" />
                                <TabTrigger value="history" icon={<History size={16} />} label="History" />
                                <TabTrigger value="activity" icon={<MessageSquare size={16} />} label="Activity" />
                            </TabsList>
                        </div>

                        {/* Tab 1: Overview */}
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-6 mb-8 text-left">
                                            <Avatar className="size-20 rounded-3xl border-4 border-lemon-primary/20">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${application.borrower.fullName}`} />
                                                <AvatarFallback className="bg-lemon-primary text-main-green font-black text-2xl">{application.borrower.fullName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-2xl font-black text-main-green">{application.borrower.fullName}</h3>
                                                <p className="text-gray-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Qualified Borrower</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">BVN VERIFIED</Badge>
                                                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">KYC LEVEL 3</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-gray-50">
                                            <InfoRow icon={<Mail size={16} />} label="Email" value={application.borrower.email} />
                                            <InfoRow icon={<Phone size={16} />} label="Phone" value={application.borrower.phone || "---"} />
                                            <InfoRow icon={<MapPin size={16} />} label="Location" value="Lagos, Nigeria" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm rounded-[32px] bg-main-green text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 size-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                                    <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Risk Assessment</p>
                                            <div className="flex items-end justify-between mb-2">
                                                <h4 className="text-4xl font-black">{riskLevel} Risk</h4>
                                                <span className="text-lemon-primary font-black text-2xl">{riskScore}/100</span>
                                            </div>
                                            <Progress value={riskScore} className="h-2 bg-white/10" indicatorClassName="bg-lemon-primary" />
                                        </div>
                                        <div className="mt-8 grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-white/5">
                                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Signals</p>
                                                <p className="font-bold text-sm">8 Positive</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5">
                                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Warnings</p>
                                                <p className="font-bold text-sm">0 Flags</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-none shadow-sm rounded-[32px]">
                                <CardHeader className="p-8 pb-0">
                                    <CardTitle className="text-xl font-black text-main-green">Loan Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Requested Amount</p>
                                            <p className="text-3xl font-black text-main-green">₦{parseFloat(application.amount).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Interest Rate</p>
                                            <p className="text-3xl font-black text-main-green">{application.interestRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Duration</p>
                                            <p className="text-3xl font-black text-main-green">{application.durationMonths} Mo</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Monthly Pay</p>
                                            <p className="text-3xl font-black text-main-green">₦{((parseFloat(application.amount) * (1 + parseFloat(application.interestRate) / 100)) / application.durationMonths).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        </div>
                                    </div>

                                    <div className="mt-12">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest">Application Timeline</p>
                                        <div className="flex items-center">
                                            <TimelineStep status="completed" label="Submitted" date={format(new Date(application.createdAt), "MMM d")} isFirst />
                                            <TimelineStep status="current" label="Reviewing" />
                                            <TimelineStep status="upcoming" label="Decision" />
                                            <TimelineStep status="upcoming" label="Funding" isLast />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2: Financial Details */}
                        <TabsContent value="financial" className="mt-0">
                            <Card className="border-none shadow-sm rounded-[32px]">
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-main-green">Employment & Income</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Employment Status</p>
                                                    <p className="font-bold">Full-time Employed</p>
                                                </Card>
                                                <Card className="p-5 border-gray-50 shadow-none bg-gray-50/50 rounded-2xl">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Monthly Income</p>
                                                    <p className="font-bold">₦250,000 - ₦400,000</p>
                                                </Card>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-main-green">Verification Status</h4>
                                            <div className="space-y-3">
                                                <VerificationItem label="Phone Verification" status="Verified" />
                                                <VerificationItem label="Email Verification" status="Verified" />
                                                <VerificationItem label="BVN Confirmation" status="Verified" />
                                                <VerificationItem label="NIN Confirmation" status="Pending" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3: Documents */}
                        <TabsContent value="documents" className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <DocumentCard title="Government Issued ID" type="International Passport" status="Verified" />
                                <DocumentCard title="Proof of Address" type="Utility Bill (Lekki)" status="Verified" />
                                <DocumentCard title="Bank Statement" type="Last 6 Months (GTB)" status="Pending" />
                            </div>
                        </TabsContent>

                        {/* Tab 4: Repayment */}
                        <TabsContent value="repayment" className="mt-0">
                            <Card className="border-none shadow-sm rounded-[32px]">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-14 rounded-2xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                                                <ShieldCheck size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-main-green">Automatic Repayment Setup</h4>
                                                <p className="text-gray-500 font-medium">Valid credit card has been linked for auto-debit.</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-50 text-green-600 font-bold border-none px-4 h-9 uppercase tracking-widest text-[10px]">Active</Badge>
                                    </div>

                                    <Separator className="bg-gray-50" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 italic font-black text-blue-800">VISA</div>
                                                <div>
                                                    <p className="font-bold text-main-green">Ending in 8902</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expires 12/26</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-main-green"><Eye size={18} /></Button>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Summary</p>
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-gray-400">Installments</span>
                                                <span className="text-main-green">{application.durationMonths} Monthly Payments</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-gray-400">Total Repayment</span>
                                                <span className="text-main-green">₦{(parseFloat(application.amount) * (1 + parseFloat(application.interestRate) / 100)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 5: History */}
                        <TabsContent value="history" className="mt-0">
                            <Card className="border-none shadow-sm rounded-[32px] bg-gray-50/30">
                                <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                                    <div className="size-20 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-200 mb-4 border border-gray-100">
                                        <History size={40} />
                                    </div>
                                    <h4 className="text-xl font-black text-main-green mb-2">New Borrower</h4>
                                    <p className="text-gray-500 max-w-sm font-medium">This is the borrower's first application on Padi Loan. No historical data available.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 6: Activity */}
                        <TabsContent value="activity" className="mt-0">
                            <Card className="border-none shadow-sm rounded-[32px]">
                                <CardContent className="p-8">
                                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-50">
                                        <ActivityItem
                                            title="Application Submitted"
                                            time={format(new Date(application.createdAt), "MMM d, yyyy h:mm a")}
                                            desc="Borrower completed the loan request form."
                                        />
                                        <ActivityItem
                                            title="Documents Verified"
                                            time="Just now"
                                            desc="System automatically verified ID and Proof of Address."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Sticky Panel */}
                <div className="xl:col-span-4 h-full">
                    <div className="sticky top-28 space-y-6">
                        <Card className="border-none shadow-lg rounded-[32px] overflow-hidden bg-[#FAFAFA]">
                            <CardContent className="p-8 space-y-6">
                                <div>
                                    <h4 className="text-lg font-black text-main-green mb-2">Decision Actions</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Finalize application status</p>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-14 rounded-2xl shadow-lg shadow-lemon-primary/20 transition-all active:scale-95 text-lg"
                                        onClick={() => setIsApproveLoading(true)}
                                        disabled={isApproveLoading}
                                    >
                                        {isApproveLoading ? <Loader2 className="animate-spin" /> : "Approve Application"}
                                    </Button>
                                    <Button variant="outline" className="w-full border-gray-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-black h-14 rounded-2xl bg-white shadow-sm text-lg">
                                        Reject Request
                                    </Button>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Communications</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="ghost" className="bg-white border border-gray-50 rounded-2xl h-12 font-bold text-xs gap-2 shadow-sm text-main-green">
                                            <MessageSquare size={14} /> Message
                                        </Button>
                                        <Button variant="ghost" className="bg-white border border-gray-50 rounded-2xl h-12 font-bold text-xs gap-2 shadow-sm text-main-green">
                                            <Mail size={14} /> Email
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                                    <div className="flex gap-3">
                                        <AlertCircle size={18} className="text-orange-500 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm font-black text-orange-900 leading-none mb-1">Pending Documents</p>
                                            <p className="text-xs text-orange-700/70 font-medium">Bank statement is still awaiting review.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button variant="ghost" className="text-gray-400 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-transparent hover:text-main-green px-0">
                                <Lock size={12} /> Internal Admin View Only
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
    return (
        <TabsTrigger
            value={value}
            className="flex-1 rounded-[24px] data-[state=active]:bg-lemon-primary data-[state=active]:text-main-green data-[state=active]:shadow-lg h-full gap-2 transition-all font-black text-xs uppercase tracking-wider text-gray-400 group"
        >
            <span className="group-data-[state=active]:scale-110 transition-transform">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-main-green truncate">{value}</p>
            </div>
        </div>
    );
}

function TimelineStep({ status, label, date, isFirst, isLast }: { status: 'completed' | 'current' | 'upcoming', label: string, date?: string, isFirst?: boolean, isLast?: boolean }) {
    return (
        <div className={cn("flex items-center relative", !isLast && "flex-1")}>
            <div className="flex flex-col items-center z-10">
                <div className={cn(
                    "size-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm",
                    status === 'completed' && "bg-lemon-primary text-main-green",
                    status === 'current' && "bg-main-green text-white",
                    status === 'upcoming' && "bg-gray-100 text-gray-300"
                )}>
                    {status === 'completed' && <CheckCircle2 size={12} />}
                </div>
                <div className="absolute top-8 text-center whitespace-nowrap">
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", status === 'upcoming' ? "text-gray-300" : "text-main-green")}>{label}</p>
                    {date && <p className="text-[9px] font-bold text-gray-400">{date}</p>}
                </div>
            </div>
            {!isLast && (
                <div className={cn(
                    "h-[2px] w-full mx-1",
                    status === 'completed' ? "bg-lemon-primary" : "bg-gray-100"
                )} />
            )}
        </div>
    );
}

function VerificationItem({ label, status }: { label: string; status: 'Verified' | 'Pending' | 'Failed' }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-50">
            <span className="text-sm font-bold text-gray-600">{label}</span>
            <Badge className={cn(
                "font-black text-[9px] border-none uppercase tracking-widest",
                status === 'Verified' ? "bg-green-50 text-green-600" : status === 'Pending' ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
            )}>
                {status}
            </Badge>
        </div>
    );
}

function DocumentCard({ title, type, status }: { title: string; type: string; status: string }) {
    return (
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-md transition-all">
            <div className="h-24 bg-gray-50 flex items-center justify-center relative group-hover:bg-lemon-primary/5 transition-colors">
                <FileText size={40} className="text-gray-200 group-hover:text-lemon-primary transition-colors" />
                <Badge className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-[9px] font-black uppercase text-main-green border-none">{status}</Badge>
            </div>
            <CardContent className="p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-sm font-bold text-main-green mb-4">{type}</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold h-9">View</Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-gray-50 rounded-xl text-gray-400"><Download size={16} /></Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityItem({ title, time, desc }: { title: string; time: string; desc: string }) {
    return (
        <div className="relative pl-8">
            <div className="absolute left-0 top-1.5 size-6 rounded-full border-4 border-white bg-lemon-primary text-main-green flex items-center justify-center z-10 shadow-sm">
                <CheckCircle2 size={10} />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h5 className="font-bold text-main-green">{title}</h5>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{time}</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
