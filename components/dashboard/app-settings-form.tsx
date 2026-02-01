"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
    Link2,
    Copy,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    Trash2,
    AlertTriangle,
    Settings,
    Percent,
    Calendar,
    Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

const appSettingsSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    defaultInterestRate: z.number().min(0).max(100),
    defaultDurationMonths: z.number().min(1).max(60),
});

type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;

interface LoanApp {
    id: string;
    name: string;
    slug: string;
    defaultInterestRate: string;
    defaultDurationMonths: number;
    isActive: boolean | null;
    createdAt: string;
}

interface AppSettingsFormProps {
    app: LoanApp;
}

export function AppSettingsForm({ app }: AppSettingsFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isActive, setIsActive] = useState(app.isActive ?? true);

    const form = useForm<AppSettingsFormValues>({
        resolver: zodResolver(appSettingsSchema),
        defaultValues: {
            name: app.name,
            slug: app.slug,
            defaultInterestRate: parseFloat(app.defaultInterestRate),
            defaultDurationMonths: app.defaultDurationMonths,
        },
    });

    const copyLink = () => {
        const url = `${window.location.origin}/apply/${app.slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    async function onSubmit(values: AppSettingsFormValues) {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/loan-apps/${app.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update app settings");
            }

            toast.success("App settings updated successfully!");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function toggleAppStatus() {
        setIsToggling(true);
        try {
            const res = await fetch(`/api/loan-apps/${app.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !isActive }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update app status");
            }

            setIsActive(!isActive);
            toast.success(`App ${!isActive ? "activated" : "deactivated"} successfully!`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsToggling(false);
        }
    }

    async function deleteApp() {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/loan-apps/${app.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete app");
            }

            toast.success("App deleted successfully!");
            router.push("/dashboard/apps");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* Back Button */}
            <Button variant="ghost" className="gap-2 text-gray-500 hover:text-main-green font-bold rounded-2xl -ml-2" asChild>
                <Link href="/dashboard/apps">
                    <ArrowLeft size={18} /> Back to Apps
                </Link>
            </Button>

            {/* App Info Card */}
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "size-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0",
                                isActive ? "bg-lemon-primary/20 text-main-green" : "bg-gray-100 text-gray-400"
                            )}>
                                {app.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-main-green">{app.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Link2 size={14} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-400">/{app.slug}</span>
                                </div>
                            </div>
                        </div>
                        <Badge className={cn(
                            "font-black text-xs border-none uppercase tracking-widest h-8 px-4",
                            isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                        )}>
                            {isActive ? <ToggleRight size={14} className="mr-1" /> : <ToggleLeft size={14} className="mr-1" />}
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl font-bold border-gray-100 shadow-sm gap-2 text-main-green hover:bg-lemon-primary/10"
                            onClick={copyLink}
                        >
                            <Copy size={16} /> Copy Application Link
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 rounded-2xl font-bold border-gray-100 shadow-sm gap-2"
                            asChild
                        >
                            <a href={`/apply/${app.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink size={16} /> Preview Page
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="border-none shadow-sm rounded-[32px]">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-lg font-black text-main-green flex items-center gap-2">
                                <Settings size={20} /> General Settings
                            </CardTitle>
                            <CardDescription className="text-gray-500">Configure your loan app&apos;s basic information and defaults.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">App Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Personal Loans"
                                                    className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs text-gray-400">A descriptive name for your loan product.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL Slug</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <span className="px-4 h-12 flex items-center bg-gray-50 border border-r-0 border-gray-100 rounded-l-2xl text-sm text-gray-400 font-bold whitespace-nowrap">
                                                        /apply/
                                                    </span>
                                                    <Input
                                                        className="h-12 rounded-l-none rounded-r-2xl border-gray-100 shadow-sm"
                                                        placeholder="personal-loans"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-xs text-gray-400">This is your public loan application link.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator className="bg-gray-50" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="defaultInterestRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Percent size={12} /> Default Interest Rate
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <Input
                                                        type="number"
                                                        className="h-12 rounded-l-2xl rounded-r-none border-gray-100 shadow-sm"
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                    />
                                                    <span className="px-4 h-12 flex items-center bg-gray-50 border border-l-0 border-gray-100 rounded-r-2xl text-sm text-gray-400 font-bold">
                                                        %
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="defaultDurationMonths"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={12} /> Default Duration
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <Input
                                                        type="number"
                                                        className="h-12 rounded-l-2xl rounded-r-none border-gray-100 shadow-sm"
                                                        {...field}
                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                    />
                                                    <span className="px-4 h-12 flex items-center bg-gray-50 border border-l-0 border-gray-100 rounded-r-2xl text-sm text-gray-400 font-bold">
                                                        months
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-12 px-8 rounded-2xl shadow-lg shadow-lemon-primary/20 gap-2"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>

            {/* App Status Card */}
            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-main-green">App Status</CardTitle>
                            <CardDescription className="text-gray-500">
                                {isActive
                                    ? "This app is currently accepting new loan applications."
                                    : "This app is paused and not accepting new applications."}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            className={cn(
                                "h-11 rounded-2xl font-bold gap-2 border-none shadow-sm",
                                isActive
                                    ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                            )}
                            onClick={toggleAppStatus}
                            disabled={isToggling}
                        >
                            {isToggling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isActive ? (
                                <><ToggleLeft size={16} /> Deactivate</>
                            ) : (
                                <><ToggleRight size={16} /> Activate</>
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Danger Zone */}
            <Card className="border-2 border-red-100 shadow-sm rounded-[32px] bg-red-50/30">
                <CardHeader className="p-8">
                    <CardTitle className="text-lg font-black text-red-700 flex items-center gap-2">
                        <AlertTriangle size={20} /> Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600/70">
                        Irreversible actions. Proceed with caution.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <div className="flex items-center justify-between gap-6">
                        <div>
                            <p className="font-black text-red-700">Delete this App</p>
                            <p className="text-sm text-red-600/70 font-medium">
                                Permanently delete this loan app and all its associated data. This cannot be undone.
                            </p>
                        </div>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="rounded-2xl font-bold h-11 px-6 shrink-0 gap-2"
                                >
                                    <Trash2 size={16} /> Delete App
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-3xl border-none shadow-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black text-red-700 flex items-center gap-2">
                                        <AlertTriangle size={20} /> Delete Loan App
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        Are you sure you want to delete <span className="font-bold text-main-green">{app.name}</span>?
                                        This action cannot be undone and will remove all associated data.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteDialog(false)}
                                        className="rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={deleteApp}
                                        disabled={isDeleting}
                                        className="rounded-2xl font-bold gap-2"
                                    >
                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                                        Yes, Delete App
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
