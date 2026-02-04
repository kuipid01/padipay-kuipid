import React from 'react'
import { SectionHeader } from './section-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Copy, ExternalLink, Link2, Loader2, Palette } from 'lucide-react'
import Image from 'next/image'

interface BrandingProps {
    brandLogoUrl: string | null
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "brand") => void
    isUploading: boolean
}

export const BrandingSection = ({ brandLogoUrl, handleFileUpload, isUploading }: BrandingProps) => {
    return (
        <div className="space-y-8">
            <SectionHeader
                icon={<Palette size={24} />}
                title="Branding & Links"
                description="Customize your loan application pages."
            />

            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-main-green">
                        Brand Settings
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Customize how borrowers see your loan pages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 border-4 border-dashed border-gray-200 overflow-hidden relative">
                            {brandLogoUrl ? (
                                <img
                                    src={brandLogoUrl}
                                    alt="Logo"
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                            )}
                        </div>
                        <div>
                            <div className="relative">
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
                                    className="rounded-2xl font-bold border-gray-100 shadow-sm h-11"
                                    onClick={() =>
                                        document.getElementById("brand-upload")?.click()
                                    }
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Upload Logo"
                                    )}
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                                PNG, SVG. Max 1MB
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Brand Color
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-main-green border-4 border-white shadow-sm" />
                            <Input
                                placeholder="#0D4715"
                                className="h-12 rounded-2xl border-gray-100 shadow-sm w-40 font-mono"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-lg font-black text-main-green">
                        Loan Links
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Your shareable loan application links.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <Link2 size={18} className="text-gray-400" />
                        <span className="font-mono text-sm text-gray-600 flex-1 truncate">
                            https://padiloan.com/apply/your-app-slug
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-main-green"
                        >
                            <Copy size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-main-green"
                        >
                            <ExternalLink size={16} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
