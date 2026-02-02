"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Link2,
    Copy,
    ExternalLink,
    Eye,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Percent,
    Calendar,
    Users,
    TrendingUp,
    Folder,
    Settings,
    BarChart3
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoanApp {
    id: string;
    name: string;
    slug: string;
    defaultInterestRate: string;
    defaultDurationMonths: number;
    isActive: boolean | null;
    createdAt: string;
    _count?: {
        applications: number;
    };
}

interface AppsListProps {
    initialApps: LoanApp[];
}

export function AppsList({ initialApps }: AppsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [appToDelete, setAppToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const filteredApps = initialApps.filter(app => {
        const matchesSearch =
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.slug.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter.length === 0 ||
            (statusFilter.includes("active") && app.isActive) ||
            (statusFilter.includes("inactive") && !app.isActive);

        return matchesSearch && matchesStatus;
    });

    const activeApps = initialApps.filter(app => app.isActive).length;
    const totalApplications = initialApps.reduce((sum, app) => sum + (app._count?.applications || 0), 0);

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/apply/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const confirmDelete = (id: string) => {
        setAppToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!appToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/loan-apps/${appToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete app");

            toast.success("Loan app deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Error deleting loan app");
            console.error(error);
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setAppToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Apps"
                    value={initialApps.length.toString()}
                    icon={<Folder className="text-blue-500" size={20} />}
                    trend="Loan products"
                    color="bg-blue-50"
                />
                <StatCard
                    label="Active Apps"
                    value={activeApps.toString()}
                    icon={<ToggleRight className="text-green-500" size={20} />}
                    trend="Accepting applications"
                    color="bg-green-50"
                />
                <StatCard
                    label="Total Applications"
                    value={totalApplications.toString()}
                    icon={<Users className="text-violet-500" size={20} />}
                    trend="Across all apps"
                    color="bg-violet-50"
                />
                <StatCard
                    label="Avg. Interest Rate"
                    value={`${initialApps.length > 0 ? (initialApps.reduce((sum, app) => sum + parseFloat(app.defaultInterestRate), 0) / initialApps.length).toFixed(1) : 0}%`}
                    icon={<Percent className="text-orange-500" size={20} />}
                    trend="Default rate"
                    color="bg-orange-50"
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors" size={18} />
                    <Input
                        placeholder="Search apps by name or slug..."
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
                                        {[{ key: "active", label: "Active" }, { key: "inactive", label: "Inactive" }].map(status => (
                                            <div key={status.key} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`status-${status.key}`}
                                                    checked={statusFilter.includes(status.key)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setStatusFilter([...statusFilter, status.key]);
                                                        else setStatusFilter(statusFilter.filter(s => s !== status.key));
                                                    }}
                                                />
                                                <label htmlFor={`status-${status.key}`} className="text-sm font-bold text-gray-600 cursor-pointer">{status.label}</label>
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

                    <Button className="h-12 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black px-6 rounded-2xl shadow-lg shadow-lemon-primary/20 gap-2" asChild>
                        <Link href="/dashboard/apps/new">
                            <Plus size={18} /> Create App
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Apps Grid */}
            {filteredApps.length === 0 ? (
                <Card className="border-none shadow-sm rounded-[32px]">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="size-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
                                <Folder size={40} />
                            </div>
                            <p className="font-black text-gray-400 text-xl mb-2">No loan apps found</p>
                            <p className="text-gray-400 mb-6 max-w-sm">Create your first loan app to start accepting applications from borrowers.</p>
                            <Button className="h-12 bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black px-8 rounded-2xl shadow-lg shadow-lemon-primary/20 gap-2" asChild>
                                <Link href="/dashboard/apps/new">
                                    <Plus size={18} /> Create Your First App
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredApps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onCopyLink={copyLink}
                            onDelete={confirmDelete}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Loan App?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the loan app and all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AppCard({ app, onCopyLink, onDelete }: { app: LoanApp; onCopyLink: (slug: string) => void; onDelete: (id: string) => void }) {
    const router = useRouter();

    return (
        <Card className="border-none shadow-sm shadow-main-green rounded-[32px] hover:shadow-md transition-all group overflow-hidden">
            <CardHeader className="p-6 pb-0">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "size-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                            app.isActive ? "bg-lemon-primary/20 text-main-green" : "bg-gray-100 text-gray-400"
                        )}>
                            {app.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-lg font-black text-main-green truncate group-hover:text-main-green/80 transition-colors">{app.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Link2 size={12} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">/{app.slug}</span>
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-gray-100 font-bold">
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer"
                                onClick={() => router.push(`/dashboard/apps/${app.id}`)}
                            >
                                <Eye size={16} className="mr-3" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer"
                                onClick={() => router.push(`/dashboard/apps/${app.id}/settings`)}
                            >
                                <Edit3 size={16} className="mr-3" /> Edit App
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-sm focus:bg-lemon-primary/10 focus:text-main-green cursor-pointer"
                                onClick={() => router.push(`/dashboard/apps/${app.id}/analytics`)}
                            >
                                <BarChart3 size={16} className="mr-3" /> View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-gray-50" />
                            <DropdownMenuItem
                                className="rounded-xl px-4 py-3 text-sm focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer"
                                onClick={() => onDelete(app.id)}
                            >
                                <Trash2 size={16} className="mr-3" /> Delete App
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <Badge className={cn(
                        "font-black text-[10px] border-none uppercase tracking-widest h-7 px-3",
                        app.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    )}>
                        {app.isActive ? <ToggleRight size={12} className="mr-1" /> : <ToggleLeft size={12} className="mr-1" />}
                        {app.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-2xl bg-gray-50/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Interest</p>
                        <p className="font-black text-main-green text-lg">{app.defaultInterestRate}%</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-gray-50/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="font-black text-main-green text-lg">{app.defaultDurationMonths}mo</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-gray-50/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Apps</p>
                        <p className="font-black text-main-green text-lg">{app._count?.applications || 0}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-2xl font-bold border-gray-100 shadow-sm gap-2 text-main-green hover:bg-lemon-primary/10"
                        onClick={() => onCopyLink(app.slug)}
                    >
                        <Copy size={14} /> Copy Link
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-2xl bg-gray-50 text-gray-400 hover:text-main-green"
                        asChild
                    >
                        <a href={`/apply/${app.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                        </a>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-2xl bg-gray-50 text-gray-400 hover:text-main-green"
                        asChild
                    >
                        <Link href={`/dashboard/apps/${app.id}/settings`}>
                            <Settings size={16} />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
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
