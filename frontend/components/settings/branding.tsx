import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HexColorPicker } from "react-colorful";
import { AlertCircle, Copy, ExternalLink, Link2, Loader2, Palette } from "lucide-react";

import { SectionHeader } from "./section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useGetUserLoanApps } from "../../hooks/user/loan-apps";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

interface BrandingProps {
  brandLogoUrl: string | null;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "brand",
  ) => void;
  isUploading: boolean;
  brandColor?: string;
  updateSettings: (values: { brandColor: string }) => Promise<boolean>;
}

const DEFAULT_COLOR = "#000000";

export const BrandingSection = ({
  brandLogoUrl,
  handleFileUpload,
  isUploading,
  brandColor,
  updateSettings,
}: BrandingProps) => {
  const { loanApps, error, isLoading } = useGetUserLoanApps();

  console.log(loanApps, "loandappps");
  const [color, setColor] = useState(brandColor ?? DEFAULT_COLOR);
  const [showPicker, setShowPicker] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /* Sync local state when prop changes */
  useEffect(() => {
    if (brandColor && brandColor !== color) {
      setColor(brandColor);
    }
  }, [brandColor]);

  // copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  const navigateToUrlNewTab = (link: string) => {
    window.open(link, "_blank");
  };

  /* Debounced save */
  useEffect(() => {
    if (!color || color === brandColor) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateSettings({ brandColor: color });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [color]);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<Palette size={24} />}
        title="Branding & Links"
        description="Customize your loan application pages."
      />

      {/* BRAND SETTINGS */}
      <Card className="border-none shadow-sm rounded-[32px]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-lg font-black text-main-green">
            Brand Settings
          </CardTitle>
          <CardDescription>
            Customize how borrowers see your loan pages.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-3xl bg-gray-100 border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {brandLogoUrl ? (
                <img
                  src={brandLogoUrl}
                  alt="Brand logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              )}
            </div>

            <div>
              <input
                type="file"
                id="brand-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "brand")}
                disabled={isUploading}
              />

              <Button
                type="button"
                variant="outline"
                className="rounded-2xl h-11 font-bold"
                disabled={isUploading}
                onClick={() => document.getElementById("brand-upload")?.click()}
              >
                {isUploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload Logo
              </Button>

              <p className="mt-2 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                PNG, SVG · Max 1MB
              </p>
            </div>
          </div>

          {/* Brand Color */}
          <div>
            <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              Brand Color
            </label>

            <div className="relative flex items-center gap-3">
              <button
                type="button"
                className="size-12 rounded-2xl border-4 border-white shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => setShowPicker((v) => !v)}
              />

              {showPicker && (
                <>
                  {/* Click-outside overlay (BEHIND picker) */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPicker(false)}
                  />

                  {/* Color picker (ON TOP) */}
                  <div className="absolute z-50 top-full mt-3">
                    <HexColorPicker color={color} onChange={setColor} />
                  </div>
                </>
              )}

              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 w-40 rounded-2xl font-mono"
                disabled={isUploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LOAN LINKS */}
      <Card className="border-none shadow-sm rounded-[32px]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-lg font-black text-main-green">
            Loan Links
          </CardTitle>
          <CardDescription>
            Your shareable loan application links.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-4">
          {/* LOADING STATE */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {error && !isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">
                Failed to load loan application links.
              </p>
            </div>
          )}

          {/* DATA LOADED STATE */}
          {!isLoading && !error && (
            <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
              {loanApps?.loanApps.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active loan applications found.
                </p>
              ) : (
                loanApps?.loanApps.map((loanApp) => (
                  <div
                    key={loanApp.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-main-green/30 transition-colors"
                  >
                    <Link2 size={18} className="text-gray-400 shrink-0" />

                    <span className="flex-1 truncate font-mono text-sm text-gray-600">
                      https://padiloan.com/apply/{loanApp.slug}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        className="group"
                        onClick={() =>
                          copyToClipboard(
                            `https://padiloan.com/apply/${loanApp.slug}`,
                          )
                        }
                        variant="ghost"
                        size="icon"
                      >
                        <Copy
                          size={16}
                          className="text-gray-400 group-hover:text-main-green"
                        />
                      </Button>

                      <Button
                        className="group"
                        onClick={() =>
                          navigateToUrlNewTab(
                            `https://padiloan.com/apply/${loanApp.slug}`,
                          )
                        }
                        variant="ghost"
                        size="icon"
                      >
                        <ExternalLink
                          size={16}
                          className="text-gray-400 group-hover:text-main-green"
                        />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
