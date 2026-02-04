
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "./section-header";
export const LoanPreferenceSection = () => {
    return (
        <div className="space-x-0.5y-8">
            <SectionHeader
                icon={<FileText size={24} />}
                title="Loan Preferences"
                description="Configure default loan rules and approval settings."
            />

            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-main-green">
                        Loan Rules
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Set default parameters for new loan applications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Minimum Loan Amount
                            </label>
                            <Input
                                placeholder="₦10,000"
                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Maximum Loan Amount
                            </label>
                            <Input
                                placeholder="₦5,000,000"
                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Default Interest Rate
                            </label>
                            <Input
                                placeholder="5%"
                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                Grace Period (Days)
                            </label>
                            <Input
                                placeholder="3"
                                className="h-12 rounded-2xl border-gray-100 shadow-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-main-green">
                                Auto-Approve
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Automatically approve low-risk applications.
                            </CardDescription>
                        </div>
                        <Badge className="bg-gray-50 text-gray-500 font-bold border-none text-[10px] uppercase tracking-widest">
                            Disabled
                        </Badge>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};  