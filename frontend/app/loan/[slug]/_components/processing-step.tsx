import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function ProcessingStep() {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="size-32 rounded-full border-4 border-gray-100 border-t-main-green animate-spin"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="text-main-green size-10 animate-pulse" />
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-2xl font-black px-8">Securing your funds...</h2>
                <div className="flex flex-col gap-2">
                    <p className="text-gray-400 text-sm animate-pulse">Running final security checks</p>
                    <div className="flex justify-center gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="size-1.5 rounded-full bg-main-green"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
