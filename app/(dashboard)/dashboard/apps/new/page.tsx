"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const appSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    defaultInterestRate: z.number().min(0).max(100),
    defaultDurationMonths: z.number().min(1).max(60),
});

type AppFormValues = z.infer<typeof appSchema>;

export default function NewLoanAppPage() {
    const [isLoading, setIsLoading] = useState(false);
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
            router.push("/dashboard");
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

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard"><ArrowLeft size={20} /></Link>
                </Button>
                <h1 className="text-2xl font-bold">Create New Loan App</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Loan App Configuration</CardTitle>
                    <CardDescription>
                        Configure the default settings for loans applied through this app link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>App Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Personal Loans for Friends" {...field} onChange={(e) => {
                                                field.onChange(e);
                                                onNameChange(e);
                                            }} />
                                        </FormControl>
                                        <FormDescription>A descriptive name for your loan dashboard.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Slug (URL)</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center">
                                                <span className="px-3 h-10 flex items-center bg-muted border border-r-0 rounded-l-md text-sm text-muted-foreground whitespace-nowrap">
                                                    myloan.com/
                                                </span>
                                                <Input className="rounded-l-none" placeholder="personal-loan" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>This will be your public link shared with borrowers.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="defaultInterestRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Interest Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                                            <FormLabel>Default Duration (Months)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button disabled={isLoading} className="w-full h-11" type="submit">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Loan App"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
