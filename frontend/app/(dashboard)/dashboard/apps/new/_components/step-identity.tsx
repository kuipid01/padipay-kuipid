"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link as LinkIcon, CheckCircle2, Copy } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AppFormValues } from "../_lib/schema";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StepIdentityProps {
  form: UseFormReturn<AppFormValues>;
}

export function StepIdentity({ form }: StepIdentityProps) {
  const [copied, setCopied] = useState(false);
  const watchSlug = form.watch("slug");
  const previewUrl = `Kuipid.com/loan/${watchSlug || "your-slug"}`;

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    const slug = value
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">App Details</h2>
        <p className="text-gray-500">Start by giving your loan portal a unique identity.</p>
      </div>

      <Card className="border-gray-100 shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-wider">App Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onNameChange(e);
                    }}
                    placeholder="e.g., Quick Capital Loans"
                    className="h-14 px-6 rounded-2xl border-gray-200 focus:border-main-green focus:ring-4 focus:ring-main-green/5 text-lg transition-all"
                  />
                </FormControl>
                <FormDescription>The name borrowers see when they visit your link.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-wider">Public Link</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-0 border-2 border-gray-100 rounded-2xl overflow-hidden focus-within:border-main-green focus-within:ring-4 focus-within:ring-main-green/5 transition-all">
                    <span className="bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-400 border-r-2 border-gray-100 whitespace-nowrap h-14 flex items-center">
                      Kuipid.com/loan/
                    </span>
                    <Input
                      {...field}
                      placeholder="your-brand-name"
                      className="border-0 shadow-none focus-visible:ring-0 h-14 rounded-none text-lg font-bold text-main-green"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchSlug && (
            <div className="flex items-center gap-4 bg-green-50/50 border-2 border-green-100/50 rounded-2xl p-4 transition-all">
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="h-5 w-5 text-main-green" />
              </div>
              <code className="text-sm font-bold text-gray-700 font-mono flex-1 truncate">{previewUrl}</code>
              <button
                type="button"
                onClick={copyPreviewUrl}
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white text-main-green transition-all"
              >
                {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
