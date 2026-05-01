"use client";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Info, ShieldCheck, Zap } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AppFormValues } from "../_lib/schema";
import { cn } from "@/lib/utils";

interface StepLimitsProps {
  form: UseFormReturn<AppFormValues>;
}

export function StepLimits({ form }: StepLimitsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Loan Boundaries</h2>
        <p className="text-gray-500">Define the financial range and automation for your app.</p>
      </div>

      <Card className="border-gray-100 shadow-xl shadow-gray-100/50 rounded-3xl">
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="minLoanAmount"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-wider">Minimum Amount</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold group-focus-within:text-main-green transition-colors">₦</span>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-14 pl-12 rounded-2xl border-gray-200 focus:border-main-green focus:ring-4 focus:ring-main-green/5 text-lg font-bold transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxLoanAmount"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-wider">Maximum Amount</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold group-focus-within:text-main-green transition-colors">₦</span>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-14 pl-12 rounded-2xl border-gray-200 focus:border-main-green focus:ring-4 focus:ring-main-green/5 text-lg font-bold transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="allowCustomAmounts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-main-green/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <FormLabel className="font-bold text-gray-900">Custom Amounts</FormLabel>
                    </div>
                    <FormDescription className="text-xs">Borrowers can pick any amount in range</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requireCreditCheck"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-main-green/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      <FormLabel className="font-bold text-gray-900">Credit Checks</FormLabel>
                    </div>
                    <FormDescription className="text-xs">Mandatory credit score verification</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="autoApprovalLimit"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-bold text-gray-700 uppercase tracking-wider">Auto-Approval Limit</FormLabel>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                </div>
                <FormControl>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold group-focus-within:text-main-green transition-colors">₦</span>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-14 pl-12 rounded-2xl border-gray-200 focus:border-main-green focus:ring-4 focus:ring-main-green/5 text-lg font-bold transition-all"
                    />
                  </div>
                </FormControl>
                <div className="flex gap-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Loans below this amount will be automatically approved if the borrower meets basic criteria, saving you manual review time.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
