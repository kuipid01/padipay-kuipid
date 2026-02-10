import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreditScoreStepProps {
    onRefresh: () => void;
    loading: boolean;
    refreshed: boolean;
    onNext: () => void;
    onBack: () => void;
}

export function CreditScoreStep({ onRefresh, loading, refreshed, onNext, onBack }: CreditScoreStepProps) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="size-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} />
            </button>

            <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-600 border-none px-3 py-1 rounded-full font-bold flex w-fit items-center gap-1">
                    <ShieldCheck size={14} />
                    Verified User
                </Badge>
                <h2 className="text-3xl font-black">Refresh Credit Score</h2>
                <p className="text-gray-500">Let&apos;s get your latest credit data to give you the best loan offer possible.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-200">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="relative mx-auto size-16">
                            <RefreshCw className="size-16 text-main-green animate-spin" />
                        </div>
                        <p className="font-bold text-gray-400 animate-pulse">Analyzing your credit history...</p>
                    </motion.div>
                ) : refreshed ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="bg-green-100 text-green-600 size-16 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">Score Updated!</h3>
                            <p className="text-gray-500 text-sm">Your credit profile is up to date.</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-gray-100 text-gray-400 size-16 rounded-full flex items-center justify-center mx-auto">
                            <RefreshCw size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Ready to refresh your score?</p>
                    </div>
                )}
            </div>

            {!refreshed ? (
                <Button
                    onClick={onRefresh}
                    disabled={loading}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Refresh Score"}
                </Button>
            ) : (
                <Button
                    onClick={onNext}
                    className="w-full h-16 rounded-[24px] bg-main-green text-white text-lg font-black"
                >
                    View Offer
                </Button>
            )}
        </div>
    );
}
