"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader2,
    ArrowLeft,
    Sparkles,
    Link as LinkIcon,
    Percent,
    Calendar,
    CheckCircle2,
    Copy,
    ExternalLink,
    Zap,
    Shield,
    Users
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const appSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    defaultInterestRate: z.number().min(0).max(100),
    defaultDurationMonths: z.number().min(1).max(60),
});

type AppFormValues = z.infer<typeof appSchema>;

const FEATURES = [
    { icon: Zap, text: "Instant loan application link" },
    { icon: Shield, text: "Secure card authorization" },
    { icon: Users, text: "Automatic borrower management" },
];

export default function NewLoanAppPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const form = useForm<AppFormValues>({
        resolver: zodResolver(appSchema),
        defaultValues: {
            name: "",
            slug: "",
            defaultInterestRate: 10,
            defaultDurationMonths: 3,
        },
    });

    const watchSlug = form.watch("slug");
    const previewUrl = `padiloan.com/loan/${watchSlug || "your-slug"}`;

    async function onSubmit(values: AppFormValues) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/loan-apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create loan app");
            }

            toast.success("Loan app created successfully!");
            router.push("/dashboard/apps");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Auto-generate slug from name
    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue("name", e.target.value);
        const slug = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        form.setValue("slug", slug, { shouldValidate: true });
    };

    const copyPreviewUrl = () => {
        navigator.clipboard.writeText(`https://${previewUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50/50 to-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-11 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-main-green/20"
                    >
                        <Link href="/dashboard/apps"><ArrowLeft size={18} /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-main-green">Create New Loan App</h1>
                        <p className="text-gray-500 text-sm">Set up a new loan application portal for your borrowers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                            <CardHeader className="p-8 pb-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="size-14 rounded-2xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black text-main-green">App Configuration</CardTitle>
                                        <CardDescription className="text-gray-500">
                                            Configure the default settings for this loan portal
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        {/* App Name */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        App Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Personal Loans, Business Loans"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                onNameChange(e);
                                                            }}
                                                            className="h-14 rounded-2xl border-gray-100 shadow-sm text-lg font-medium focus:border-main-green focus:ring-main-green/20"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-gray-400 text-xs">
                                                        A descriptive name to identify this loan app in your dashboard
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Custom Slug */}
                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Custom URL Slug
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center">
                                                            <span className="px-4 h-14 flex items-center bg-gray-50 border border-r-0 border-gray-100 rounded-l-2xl text-sm text-gray-400 font-bold whitespace-nowrap">
                                                                <LinkIcon size={14} className="mr-2" />
                                                                padiloan.com/loan/
                                                            </span>
                                                            <Input
                                                                className="h-14 rounded-l-none rounded-r-2xl border-gray-100 shadow-sm text-lg font-medium focus:border-main-green focus:ring-main-green/20"
                                                                placeholder="your-slug"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription className="text-gray-400 text-xs">
                                                        This will be the public link you share with borrowers
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Separator className="bg-gray-100" />

                                        {/* Loan Settings */}
                                        <div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                                Default Loan Settings
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="defaultInterestRate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                                                <div className="size-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                                                                    <Percent size={14} />
                                                                </div>
                                                                Interest Rate
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                                        className="h-14 rounded-2xl border-gray-100 shadow-sm text-xl font-bold pr-12 focus:border-main-green focus:ring-main-green/20"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
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
                                                            <FormLabel className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                                                <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                                    <Calendar size={14} />
                                                                </div>
                                                                Duration
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={e => field.onChange(Number(e.target.value))}
                                                                        className="h-14 rounded-2xl border-gray-100 shadow-sm text-xl font-bold pr-20 focus:border-main-green focus:ring-main-green/20"
                                                                    />
                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">months</span>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-100" />

                                        {/* Submit Button */}
                                        <Button
                                            disabled={isLoading}
                                            className="w-full h-14 rounded-2xl bg-main-green hover:bg-main-green/90 text-white font-black text-lg shadow-lg shadow-main-green/20"
                                            type="submit"
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                                            ) : (
                                                <><Sparkles className="mr-2" size={20} /> Create Loan App</>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Live Preview Card */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-gradient-to-br from-main-green to-main-green/90 text-white">
                            <CardHeader className="p-6 pb-4">
                                <Badge className="w-fit bg-white/20 text-white font-bold border-none text-[10px] uppercase tracking-widest mb-2">
                                    Live Preview
                                </Badge>
                                <CardTitle className="text-lg font-black">Your Public Link</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-4">
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Share this URL</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-sm font-mono truncate text-lemon-primary">
                                            {previewUrl}
                                        </code>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={copyPreviewUrl}
                                            className="size-8 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                        >
                                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        </Button>
                                    </div>
                                </div>

                                <a
                                    href={`/loan/${watchSlug || "preview"}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-lemon-primary text-main-green font-bold hover:bg-lemon-primary/90 transition-colors"
                                >
                                    Preview Page <ExternalLink size={16} />
                                </a>
                            </CardContent>
                        </Card>

                        {/* Features Card */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                            <CardHeader className="p-6 pb-4">
                                <CardTitle className="text-sm font-black text-main-green">What You Get</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <ul className="space-y-4">
                                    {FEATURES.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-lemon-primary/20 flex items-center justify-center text-main-green shrink-0">
                                                <feature.icon size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-gradient-to-br from-violet-50 to-violet-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-violet-900 mb-1">Pro Tip</h4>
                                        <p className="text-sm text-violet-600/80">
                                            Use descriptive slugs like &ldquo;business-loans&rdquo; or &ldquo;emergency-fund&rdquo; for
                                            better organization and easy sharing.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
