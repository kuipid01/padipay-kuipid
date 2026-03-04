"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    ChevronDown,
    ArrowUpDown,
    Download,
    Mail,
    Phone
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Application {
    id: string;
    borrower: {
        fullName: string;
        email: string;
        phone: string;
        avatar?: string;
    };
    loanApp: {
        name: string;
    };
    amount: string;
    durationMonths: number;
    interestRate: string;
    status: string;
    riskLevel: "Low" | "Medium" | "High";
    createdAt: string;
}

interface ApplicationsListProps {
    initialApplications: any[];
}

export function ApplicationsList({ initialApplications }: ApplicationsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [approving, setApproving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [riskFilter, setRiskFilter] = useState<string[]>([]);

    // Transform initial data and add mocks for risk level
    const apps = initialApplications.map(app => ({
        ...app,
        riskLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as any // Mock risk for now
    }));

    const filteredApps = apps.filter(app => {
        const matchesSearch =
            app.borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.borrower.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.id.includes(searchQuery);

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(app.status);
        const matchesRisk = riskFilter.length === 0 || riskFilter.includes(app.riskLevel);

        return matchesSearch && matchesStatus && matchesRisk;
    });
    //function to approve the loan 
    const approveLoan = async (appId: string) => {
        try {
            if (!appId) throw new Error("Invalid application ID");
            setApproving(true);
            const res = await fetch(`/api/loans/${appId}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },

            });
            if (!res.ok) {
                throw new Error("Failed to approve loan");

            }
            setApproving(false);
            toast.success("Loan approved successfully");
        } catch (err: any) {
            toast.error(err.message);
            setApproving(false);
        }

    }
    console.log("APPLICATIONS,", apps)
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        placeholder="Search by name, email or ID..."
                        className="pl-12 h-12 bg-white border-gray-100 rounded-2xl focus-visible:ring-main-green shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-12 border-gray-100 rounded-2xl gap-2 font-bold px-6 bg-white shadow-sm">
                                <Filter size={18} /> Filters
                                {(statusFilter.length > 0 || riskFilter.length > 0) && (
                                    <Badge className="bg-main-green text-white rounded-full px-1.5 h-5 min-w-5">
                                        {statusFilter.length + riskFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-gray-100" align="end">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Status</p>
                                    <div className="space-y-2">
                                        {["PENDING", "APPROVED", "REJECTED"].map(status => (
                                            <div key={status} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`status-${status}`}
                                                    checked={statusFilter.includes(status)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setStatusFilter([...statusFilter, status]);
                                                        else setStatusFilter(statusFilter.filter(s => s !== status));
                                                    }}
                                                />
                                                <label htmlFor={`status-${status}`} className="text-sm font-bold text-gray-600 cursor-pointer">{status}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Risk Level</p>
                                    <div className="space-y-2">
                                        {["Low", "Medium", "High"].map(risk => (
                                            <div key={risk} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`risk-${risk}`}
                                                    checked={riskFilter.includes(risk)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setRiskFilter([...riskFilter, risk]);
                                                        else setRiskFilter(riskFilter.filter(r => r !== risk));
                                                    }}
                                                />
                                                <label htmlFor={`risk-${risk}`} className="text-sm font-bold text-gray-600 cursor-pointer">{risk}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-bold text-red-500 hover:text-red-600 p-0 h-8"
                                    onClick={() => {
                                        setStatusFilter([]);
                                        setRiskFilter([]);
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" className="h-12 border-gray-100 rounded-2xl gap-2 font-bold px-6 bg-white shadow-sm overflow-hidden group">
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden rounded-[32px]">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest px-8 h-14">Borrower</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Amount Requested</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Terms</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Risk Level</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Date</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                            <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest text-right px-8 h-14">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredApps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-2">
                                            <Search size={32} />
                                        </div>
                                        <p className="font-black text-gray-400">No applications found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApps.map((app) => (
                                <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors border-gray-50 group">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-lemon-primary/10 flex items-center justify-center text-main-green font-black text-xs shrink-0">
                                                {app.borrower.firstName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-main-green truncate group-hover:text-primary transition-colors">{app.borrower.fullName}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase"><Mail size={10} /> {app.borrower.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <p className="font-black text-lg">₦{parseFloat(app.amount).toLocaleString()}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-bold text-gray-600">{app.durationMonths} Months</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase">{app.interestRate}% Interest</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "size-2 rounded-full",
                                                app.riskLevel === "Low" ? "bg-green-500" : app.riskLevel === "Medium" ? "bg-orange-500" : "bg-red-500"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                app.riskLevel === "Low" ? "text-green-600" : app.riskLevel === "Medium" ? "text-orange-600" : "text-red-600"
                                            )}>{app.riskLevel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <p className="text-sm font-bold text-gray-500">{format(new Date(app.createdAt), "MMM d, yyyy")}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{format(new Date(app.createdAt), "h:mm a")}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge
                                            className={cn(
                                                "font-black text-[10px] border-none uppercase tracking-widest h-7 px-3",
                                                app.status === "PENDING" && "bg-orange-50 text-orange-600",
                                                app.status === "APPROVED" && "bg-green-50 text-green-600",
                                                app.status === "REJECTED" && "bg-red-50 text-red-600"
                                            )}
                                        >
                                            {app.status === "PENDING" ? <Clock size={12} className="mr-1" /> : app.status === "APPROVED" ? <CheckCircle2 size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-main-green hover:bg-lemon-primary/10 gap-2" asChild>
                                                <Link href={`/dashboard/applications/${app.id}`}>
                                                    <Eye size={16} /> Review
                                                </Link>
                                            </Button>
                                            {app.status === "PENDING" && <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-10 rounded-xl text-gray-400">
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-gray-100 font-bold">
                                                    <DropdownMenuItem onClick={() => {
                                                        if (approving) return;
                                                        approveLoan(app.id)
                                                    }} className="rounded-xl px-4 py-3 text-sm focus:bg-green-50 focus:text-green-600 cursor-pointer">
                                                        <CheckCircle2 size={16} className="mr-3" /> {approving ? "Approving..." : "Approve"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl px-4 py-3 text-sm focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer">
                                                        <XCircle size={16} className="mr-3" /> Reject
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
