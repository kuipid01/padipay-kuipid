import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { EMPLOYMENT_TYPES, LGAS_BY_STATE, NIGERIAN_STATES, WAGE_RANGES } from "../constants";
import { FormData } from "../types";

interface KycStepProps {
    formData: FormData;
    update: (updates: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function KycStep({ formData, update, onNext, onBack }: KycStepProps) {
    const lgas = LGAS_BY_STATE[formData.state] || [];

    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-lemon-primary/20 text-main-green border-none px-3 py-1 rounded-full font-bold">Step 7 of 8</Badge>
                <h2 className="text-3xl font-black">Final Details</h2>
                <p className="text-gray-500">Just a few more things to complete your profile.</p>
            </div>

            <div className="space-y-6">
                {!formData.fullName && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                        <Input
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => update({ fullName: e.target.value })}
                            className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold"
                        />
                    </div>
                )}

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Employment & Income</label>
                    <div className="grid grid-cols-1 gap-4">
                        <Select value={formData.employmentType} onValueChange={(val) => update({ employmentType: val })}>
                            <SelectTrigger className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold">
                                <SelectValue placeholder="Employment Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[20px] border-gray-100">
                                {EMPLOYMENT_TYPES.map(type => (
                                    <SelectItem key={type} value={type} className="rounded-xl">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={formData.wagesRange} onValueChange={(val) => update({ wagesRange: val })}>
                            <SelectTrigger className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold">
                                <SelectValue placeholder="Monthly Income Range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[20px] border-gray-100">
                                {WAGE_RANGES.map(range => (
                                    <SelectItem key={range} value={range} className="rounded-xl">{range}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Separator className="bg-gray-50" />
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Residential Address</label>
                    <Input
                        placeholder="123 Street Name, Area"
                        value={formData.address}
                        onChange={(e) => update({ address: e.target.value })}
                        className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={formData.state} onValueChange={(val) => update({ state: val, lga: "" })}>
                            <SelectTrigger className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[20px] border-gray-100">
                                {NIGERIAN_STATES.map(state => (
                                    <SelectItem key={state} value={state} className="rounded-xl">{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {lgas.length > 0 ? (
                            <Select value={formData.lga} onValueChange={(val) => update({ lga: val })}>
                                <SelectTrigger className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold">
                                    <SelectValue placeholder="LGA" />
                                </SelectTrigger>
                                <SelectContent className="rounded-[20px] border-gray-100">
                                    {lgas.map(lga => (
                                        <SelectItem key={lga} value={lga} className="rounded-xl">{lga}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                placeholder="LGA / City"
                                value={formData.lga || formData.city} // Fallback to city if lga is empty
                                onChange={(e) => update({ lga: e.target.value, city: e.target.value })}
                                className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Separator className="bg-gray-50" />
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Next of Kin</label>
                    <div className="space-y-3">
                        <Input
                            placeholder="Full Name"
                            value={formData.nextOfKinName}
                            onChange={(e) => update({ nextOfKinName: e.target.value })}
                            className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold"
                        />
                        <Input
                            placeholder="Phone Number"
                            value={formData.nextOfKinPhone}
                            onChange={(e) => update({ nextOfKinPhone: e.target.value })}
                            className="h-16 px-6 rounded-[24px] border-2 border-gray-100 font-bold"
                        />
                    </div>
                </div>

                <Button
                    onClick={onNext}
                    disabled={!formData.address || !formData.nextOfKinName || !formData.employmentType || !formData.wagesRange || !formData.state}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black mt-4"
                >
                    Continue <ArrowRight className="ml-2" />
                </Button>
            </div>
        </div>
    );
}
