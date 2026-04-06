"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    Eye,
    Download,
    Mail,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Banknote,
    Calendar,
    ArrowUpRight
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
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LoansListProps {
    initialLoans: any[];
}

export function LoansList({ initialLoans }: LoansListProps) {
    console.log(initialLoans, "initialLoans")
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);

    const filteredLoans = initialLoans.filter(loan => {
        const matchesSearch =
            loan.borrower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.borrower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.borrower.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.id.includes(searchQuery);

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(loan.status);

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const totalPrincipal = initialLoans.reduce((sum, loan) => sum + parseFloat(loan.principal), 0);
    const totalPayable = initialLoans.reduce((sum, loan) => sum + parseFloat(loan.totalPayable), 0);
    const activeLoans = initialLoans.filter(loan => loan.status === "ACTIVE").length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Active Loans"
                    value={activeLoans.toString()}
                    icon={<Banknote className="text-blue-500" size={20} />}
                    trend="+3 this month"
                    color="bg-blue-50"
                />
                <StatCard
                    label="Total Principal"
                    value={`₦${totalPrincipal.toLocaleString()}`}
                    icon={<TrendingUp className="text-green-500" size={20} />}
                    trend="Capital deployed"
                    color="bg-green-50"
                />
                <StatCard
                    label="Expected Returns"
                    value={`₦${totalPayable.toLocaleString()}`}
                    icon={<TrendingDown className="text-violet-500" size={20} />}
                    trend="Total payable"
                    color="bg-violet-50"
                />
                <StatCard
                    label="On-Time Rate"
                    value="96%"
                    icon={<CheckCircle2 className="text-emerald-500" size={20} />}
                    trend="Payment success"
                    color="bg-emerald-50"
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        placeholder="Search by borrower name or ID..."
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
                                {statusFilter.length > 0 && (
                                    <Badge className="bg-main-green text-white rounded-full px-1.5 h-5 min-w-5">
                                        {statusFilter.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-gray-100" align="end">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Status</p>
                                    <div className="space-y-2">
                                        {["ACTIVE", "COMPLETED", "DEFAULTED"].map(status => (
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
                                <Button
                                    variant="ghost"
                                    className="w-full text-xs font-bold text-red-500 hover:text-red-600 p-0 h-8"
                                    onClick={() => setStatusFilter([])}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" className="h-12 border-gray-100 rounded-2xl gap-2 font-bold px-6 bg-white shadow-sm overflow-hidden group">
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Export
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <Card className="border-none shadow-sm overflow-hidden rounded-[32px]">
                <div className="overflow-x-auto">
                    <Table className="min-w-[900px]">
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest px-8 h-14">Borrower</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Principal</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Total Payable</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Progress</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Start Date</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest h-14">Status</TableHead>
                                <TableHead className="font-black text-main-green uppercase text-[10px] tracking-widest text-right px-8 h-14">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLoans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="size-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-2">
                                                <Banknote size={32} />
                                            </div>
                                            <p className="font-black text-gray-400">No loans found</p>
                                            <p className="text-sm text-gray-400">Approve applications to begin tracking loans here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLoans.map((loan) => {
                                    // Mock progress (would be calculated from repayments)
                                    const progress = Math.floor(Math.random() * 80) + 10;

                                    return (
                                        <TableRow key={loan.id} className="hover:bg-gray-50/50 transition-colors border-gray-50 group">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-lemon-primary/10 flex items-center justify-center text-main-green font-black text-xs shrink-0">
                                                        {loan.borrower.firstName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-main-green truncate group-hover:text-primary transition-colors">{loan.borrower.fullName}</p>
                                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase">
                                                            <Mail size={10} /> {loan.borrower.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <p className="font-black text-lg">₦{parseFloat(loan.principal).toLocaleString()}</p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <p className="font-bold text-gray-600">₦{parseFloat(loan.totalPayable).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase">+₦{(parseFloat(loan.totalPayable) - parseFloat(loan.principal)).toLocaleString()} interest</p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="w-24">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-black text-main-green">{progress}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-1.5 bg-gray-100" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <p className="text-sm font-bold text-gray-500">{format(new Date(loan.startDate), "MMM d, yyyy")}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter flex items-center gap-1">
                                                    <Calendar size={10} /> Started
                                                </p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Badge
                                                    className={cn(
                                                        "font-black text-[10px] border-none uppercase tracking-widest h-7 px-3",
                                                        loan.status === "ACTIVE" && "bg-green-50 text-green-600",
                                                        loan.status === "COMPLETED" && "bg-blue-50 text-blue-600",
                                                        loan.status === "DEFAULTED" && "bg-red-50 text-red-600"
                                                    )}
                                                >
                                                    {loan.status === "ACTIVE" ? <Clock size={12} className="mr-1" /> : loan.status === "COMPLETED" ? <CheckCircle2 size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
                                                    {loan.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-main-green hover:bg-lemon-primary/10 gap-2" asChild>
                                                        <Link href={`/dashboard/loans/${loan.id}`}>
                                                            <Eye size={16} /> View
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-10 rounded-xl text-gray-400">
                                                                <MoreHorizontal size={18} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-gray-100 font-bold">
                                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer">
                                                                <ArrowUpRight size={16} className="mr-3" /> Send Reminder
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer">
                                                                <Download size={16} className="mr-3" /> Download Schedule
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

function StatCard({ label, value, icon, trend, color }: { label: string; value: string; icon: React.ReactNode; trend: string; color: string }) {
    return (
        <Card className="border-main-green/10 shadow-sm hover:shadow-md transition-shadow group overflow-hidden rounded-[24px]">
            <CardContent className="p-6 flex flex-col justify-between relative">
                <div className={cn("absolute top-0 right-0 m-4 w-fit h-fit opacity-20 group-hover:scale-110 transition-transform duration-500 group-hover:opacity-50", color)}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-black text-main-green">{value}</h3>
                <div className="mt-3">
                    <Badge variant="secondary" className="bg-gray-50 text-gray-500 text-[10px] font-bold border-none">
                        {trend}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
