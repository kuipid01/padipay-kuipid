"use client";

import { cn } from "@/lib/utils";
import { STEPS } from "../_lib/schema";
import { CheckCircle2, Lightbulb, ChevronDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StepInfoProps {
  currentStep: number;
  isSideCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function StepInfo({ currentStep, isSideCollapsed, onToggleCollapse }: StepInfoProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const step = STEPS.find((s) => s.id === currentStep) || STEPS[0];

  // Collapse details when step changes
  useEffect(() => {
    setIsDetailsExpanded(false);
  }, [currentStep]);

  return (
    <div className={cn(
      "h-full flex flex-col justify-between p-6 md:p-8 text-white relative overflow-hidden transition-all duration-500",
      isSideCollapsed && "md:p-4 md:items-center"
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-green-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar Toggle Button (Desktop Only) */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all hover:scale-110 active:scale-95"
      >
        <motion.div
          animate={{ rotate: isSideCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </motion.div>
      </button>

      <div className={cn("relative z-10 w-full", isSideCollapsed && "flex flex-col items-center")}>
        <div className={cn(
          "flex items-center justify-between mb-6 md:mb-8",
          isSideCollapsed && "flex-col gap-8"
        )}>
          <div className={cn("flex items-center gap-2", isSideCollapsed && "flex-col")}>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl">
              <step.icon className="h-5 w-5 text-white" />
            </div>
            {!isSideCollapsed ? (
              <span className="text-sm font-medium tracking-wider uppercase opacity-80">
                Step {currentStep} of {STEPS.length}
              </span>
            ) : (
              <span className="text-xs font-bold opacity-60 rotate-0 md:rotate-90 md:mt-4">
                STEP {currentStep}
              </span>
            )}
          </div>

          {/* Mobile/Small Screen Toggle Button */}
          {!isSideCollapsed && (
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold border border-white/10"
            >
              {isDetailsExpanded ? "Hide Details" : "Show Guide"}
              <motion.div
                animate={{ rotate: isDetailsExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.div>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isSideCollapsed ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {step.title}
              </h1>

              {/* Content Container */}
              <motion.div
                initial={false}
                animate={{ 
                  height: isDetailsExpanded || typeof window !== 'undefined' && window.innerWidth >= 768 ? "auto" : 0,
                  opacity: isDetailsExpanded || typeof window !== 'undefined' && window.innerWidth >= 768 ? 1 : 0
                }}
                className="overflow-hidden md:!h-auto md:!opacity-100"
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                <p className="text-base md:text-lg text-green-50 mb-8 leading-relaxed opacity-90">
                  {step.details}
                </p>

                <div className="space-y-4 pb-4 md:pb-0">
                  <div className="flex items-center gap-2 text-green-200 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-semibold uppercase tracking-widest">
                      Pro Tips
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {step.tips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="flex items-start gap-3 text-sm text-white/80"
                      >
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={cn(
        "relative z-10 mt-6 md:mt-12 pt-6 md:pt-12 border-t border-white/10 w-full",
        isSideCollapsed && "md:mt-0 md:pt-0 md:border-0"
      )}>
        {!isSideCollapsed ? (
          <div className="flex justify-between items-center">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-500 flex-1 mx-0.5",
                  s.id === currentStep
                    ? "bg-white"
                    : s.id < currentStep
                    ? "bg-white/40"
                    : "bg-white/10"
                )}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "w-1 rounded-full transition-all duration-500 h-4 mx-0.5",
                  s.id === currentStep
                    ? "bg-white h-8"
                    : s.id < currentStep
                    ? "bg-white/40"
                    : "bg-white/10"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
